import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ChatConversation,
  ChatMessage,
  ChatMessageRequest,
  ChatMessageType,
  ChatParticipant,
  ChatSocketEnvelope,
} from '../models/chat.models';
import { UsuarioModel } from '../models/usuario.model';
import { ChatHttpService } from '../servicos/chat/chat-http.service';
import { ChatSocketService } from '../servicos/chat/chat-socket.service';
import { Subscription, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.css',
})
export class ChatPageComponent implements OnInit, OnDestroy {
  conversations: ChatConversation[] = [];
  activeConversation?: ChatConversation;
  messages: ChatMessage[] = [];
  activeRecipient?: ChatParticipant;
  chatForm!: FormGroup;
  loadingConversations = true;
  loadingMessages = false;
  currentUserId = this.resolveCurrentUserId();
  showSearchDialog = false;
  searchTerm = '';
  searchResults: UsuarioModel[] = [];
  searchExecuted = false;
  searchLoading = false;
  readonly defaultAvatar = 'assets/icons/user-placeholder.svg';

  private activeConversationSub?: Subscription;
  private readonly subscriptions: Subscription[] = [];
  private readonly pendingAvatarFetch = new Set<string>();

  constructor(
    private readonly chatHttp: ChatHttpService,
    private readonly chatSocket: ChatSocketService,
    private readonly fb: FormBuilder
  ) {}

  async ngOnInit(): Promise<void> {
    this.chatForm = this.fb.group({
      message: ['', Validators.required],
    });

    if (!this.currentUserId) {
      console.warn('Usuário não identificado. Verifique o fluxo de login.');
      return;
    }

    await this.chatSocket.connect();
    this.subscribeToUserQueue();
    await this.loadConversations();
  }

  ngOnDestroy(): void {
    this.activeConversationSub?.unsubscribe();
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.chatSocket.disconnect();
  }

  async loadConversations(options: { preserveActive?: boolean } = {}): Promise<void> {
    const { preserveActive = false } = options;
    const activeId = preserveActive ? this.activeConversation?.id : undefined;
    this.loadingConversations = true;
    try {
      const rawConversations = await firstValueFrom(
        this.chatHttp.listConversations(this.currentUserId)
      );
      this.conversations = this.normalizeConversations(rawConversations);
      this.conversations.forEach(conversation => this.ensureConversationAvatars(conversation));

      if (!this.conversations.length) {
        this.activeConversation = undefined;
        this.activeRecipient = undefined;
        return;
      }

      if (activeId) {
        const current = this.conversations.find(conversation => conversation.id === activeId);
        if (current) {
          this.activeConversation = current;
          this.activeRecipient = this.getFirstParticipant(current);
          this.ensureConversationAvatars(current);
          return;
        }
      }

      await this.selectConversation(this.conversations[0]);
    } finally {
      this.loadingConversations = false;
    }
  }

  async selectConversation(conversation: ChatConversation): Promise<void> {
    if (this.activeConversation?.id === conversation.id) {
      return;
    }

    this.activeConversation = conversation;
    this.activeRecipient = this.getFirstParticipant(conversation);
    this.ensureConversationAvatars(conversation);
    this.loadingMessages = true;
    this.activeConversationSub?.unsubscribe();

    try {
      const page = await firstValueFrom(
        this.chatHttp.listMessages(conversation.id)
      );
      this.messages = [...page.content].reverse();
    } finally {
      this.loadingMessages = false;
    }

    this.activeConversationSub = this.chatSocket
      .subscribeToConversation(conversation.id)
      .subscribe(envelope => this.handleConversationEnvelope(envelope));
  }

  async onSubmit(): Promise<void> {
    if (!this.chatForm.valid || !this.activeConversation) {
      return;
    }

    const rawMessage: string = this.chatForm.value.message ?? '';
    const content = rawMessage.trim();
    if (!content) {
      return;
    }

    const payload: ChatMessageRequest = {
      conversationId: this.activeConversation.id,
      content,
      type: ChatMessageType.TEXT,
    };

    this.chatForm.reset();
    this.chatSocket.sendMessage(this.currentUserId, payload);
  }

  extractParticipants(conversation: ChatConversation): ChatParticipant[] {
    return conversation.participants.filter(p => p.id !== this.currentUserId);
  }

  getFirstParticipant(conversation: ChatConversation): ChatParticipant | undefined {
    const participants = this.extractParticipants(conversation);
    return participants.length ? participants[0] : undefined;
  }

  openNewConversationDialog(): void {
    this.showSearchDialog = true;
  }

  closeNewConversationDialog(): void {
    this.showSearchDialog = false;
    this.searchTerm = '';
    this.searchResults = [];
    this.searchExecuted = false;
    this.searchLoading = false;
  }

  async searchUsers(): Promise<void> {
    const term = this.searchTerm.trim();
    if (!term) {
      this.searchResults = [];
      this.searchExecuted = false;
      return;
    }

    this.searchExecuted = true;

    this.searchLoading = true;
    try {
      const results = await firstValueFrom(this.chatHttp.searchUsers(term));
      const existingParticipants = new Set(
        this.conversations.flatMap(conversation =>
          conversation.participants.map(participant => participant.id)
        )
      );
      this.ensureConversationAvatars(this.activeConversation);
      this.searchResults = results
        .filter(
          user => user.id_user !== this.currentUserId && !existingParticipants.has(user.id_user)
        )
        .map(user => ({
          ...user,
          avatarUrl: this.normalizeAvatarUrl(user.avatarUrl),
        }));
    } catch (error) {
      console.error('Erro ao buscar usuários', error);
      this.searchResults = [];
    } finally {
      this.searchLoading = false;
    }
  }

  selectSearchResult(user: UsuarioModel): void {
    if (!user.id_user) {
      return;
    }

    const sub = this.chatHttp
      .createDirectConversation(this.currentUserId, user.id_user)
      .subscribe({
        next: conversation => {
          const normalized = this.normalizeConversation(conversation);
          this.conversations = [
            normalized,
            ...this.conversations.filter(existing => existing.id !== normalized.id),
          ];
          this.closeNewConversationDialog();
          void this.selectConversation(normalized);
        },
        error: err => console.error('Não foi possível criar conversa', err),
      });

    this.subscriptions.push(sub);
  }

  avatarSrc(source?: string | null): string {
    return this.normalizeAvatarUrl(source) ?? this.defaultAvatar;
  }

  onAvatarError(event: Event): void {
    const target = event.target as HTMLImageElement | null;
    if (!target) {
      return;
    }

    if (target.dataset['fallbackApplied'] === 'true') {
      return;
    }

    target.dataset['fallbackApplied'] = 'true';
    target.src = this.defaultAvatar;
  }

  async deleteMessage(message: ChatMessage): Promise<void> {
    if (message.senderId !== this.currentUserId) {
      return;
    }

    const confirmed = window.confirm('Deseja realmente excluir esta mensagem?');
    if (!confirmed) {
      return;
    }

    try {
      await firstValueFrom(this.chatHttp.deleteMessage(this.currentUserId, message.id));
      this.messages = this.messages.filter(item => item.id !== message.id);
    } catch (error) {
      console.error('Não foi possível excluir a mensagem', error);
    }
  }

  async deleteActiveConversation(): Promise<void> {
    if (!this.activeConversation) {
      return;
    }

    const confirmed = window.confirm('Deseja realmente excluir este chat?');
    if (!confirmed) {
      return;
    }

    const conversationId = this.activeConversation.id;
    try {
      await firstValueFrom(
        this.chatHttp.deleteConversation(this.currentUserId, conversationId)
      );
      this.removeConversationFromList(conversationId);
    } catch (error) {
      console.error('Não foi possível excluir o chat', error);
    }
  }

  private subscribeToUserQueue(): void {
    try {
      const sub = this.chatSocket
        .subscribeToUserQueue(this.currentUserId)
        .subscribe(envelope => this.handleIncomingEnvelope(envelope));
      this.subscriptions.push(sub);
    } catch (error) {
      console.error('Não foi possível assinar a fila do usuário', error);
    }
  }

  private handleIncomingEnvelope(envelope: ChatSocketEnvelope): void {
    if (!envelope) {
      return;
    }

    if (envelope.eventType === 'CONVERSATION_DELETED') {
      this.removeConversationFromList(envelope.conversationId);
      return;
    }

    const existingIndex = this.conversations.findIndex(
      conversation => conversation.id === envelope.conversationId
    );

    if (existingIndex >= 0) {
      const current = this.conversations[existingIndex];

      if (envelope.eventType === 'MESSAGE_CREATED') {
        const updatedConversation = this.normalizeConversation({
          ...current,
          updatedAt: envelope.createdAt ?? current.updatedAt,
        });

        const updatedList = [...this.conversations];
        updatedList.splice(existingIndex, 1);
        updatedList.unshift(updatedConversation);
        this.conversations = updatedList;
        this.ensureConversationAvatars(updatedConversation);

        if (this.activeConversation?.id === updatedConversation.id) {
          this.activeConversation = updatedConversation;
          this.activeRecipient = this.getFirstParticipant(updatedConversation);
        }
        return;
      }

      if (envelope.eventType === 'MESSAGE_DELETED') {
        const updatedConversation = this.normalizeConversation({
          ...current,
          updatedAt: envelope.createdAt ?? current.updatedAt,
        });

        const updatedList = [...this.conversations];
        updatedList[existingIndex] = updatedConversation;
        this.conversations = updatedList;
        this.ensureConversationAvatars(updatedConversation);
        return;
      }

      return;
    }

    void this.loadConversations({ preserveActive: true });
  }

  private handleConversationEnvelope(envelope: ChatSocketEnvelope): void {
    if (!envelope) {
      return;
    }

    switch (envelope.eventType) {
      case 'MESSAGE_CREATED':
        this.appendIncomingMessage(envelope);
        break;
      case 'MESSAGE_DELETED':
        this.removeMessageFromActive(envelope);
        break;
      case 'CONVERSATION_DELETED':
        this.removeConversationFromList(envelope.conversationId);
        break;
      default:
        break;
    }
  }

  private appendIncomingMessage(envelope: ChatSocketEnvelope): void {
    if (!this.activeConversation || this.activeConversation.id !== envelope.conversationId) {
      return;
    }

    if (!envelope.messageId) {
      return;
    }

    const alreadyExists = this.messages.some(message => message.id === envelope.messageId);
    if (alreadyExists) {
      return;
    }

    const participant = this.activeConversation.participants.find(item => item.id === envelope.senderId);
    const senderDisplayName =
      envelope.senderName ?? participant?.fullname ?? participant?.username ?? 'Usuário';

    const message: ChatMessage = {
      id: envelope.messageId,
      conversationId: envelope.conversationId,
      senderId: envelope.senderId ?? '',
      senderName: senderDisplayName,
      content: envelope.content ?? '',
      createdAt: envelope.createdAt ?? new Date().toISOString(),
      mediaUrl: envelope.mediaUrl,
      type: (envelope.type as ChatMessageType) ?? ChatMessageType.TEXT,
    };

    this.messages = [...this.messages, message];
    this.ensureConversationAvatars(this.activeConversation);
  }

  private removeMessageFromActive(envelope: ChatSocketEnvelope): void {
    if (!this.activeConversation || this.activeConversation.id !== envelope.conversationId) {
      return;
    }

    if (!envelope.messageId) {
      return;
    }

    const hasMessage = this.messages.some(message => message.id === envelope.messageId);
    if (!hasMessage) {
      return;
    }

    this.messages = this.messages.filter(message => message.id !== envelope.messageId);
  }

  private removeConversationFromList(conversationId: string): void {
    const exists = this.conversations.some(conversation => conversation.id === conversationId);
    if (!exists) {
      return;
    }

    this.conversations = this.conversations.filter(conversation => conversation.id !== conversationId);

    if (this.activeConversation?.id === conversationId) {
      this.activeConversationSub?.unsubscribe();
      this.activeConversationSub = undefined;
      this.activeConversation = undefined;
      this.activeRecipient = undefined;
      this.messages = [];

      if (this.conversations.length) {
        void this.selectConversation(this.conversations[0]);
      }
    }
  }

  private ensureConversationAvatars(conversation?: ChatConversation): void {
    if (!conversation) {
      return;
    }

    conversation.participants
      .filter(participant => participant.id !== this.currentUserId && (!participant.avatarUrl || !participant.fullname))
      .forEach(participant => this.fetchAndApplyParticipantDetails(conversation.id, participant.id));
  }

  private fetchAndApplyParticipantDetails(conversationId: string, participantId: string): void {
    const cacheKey = `${conversationId}:${participantId}`;
    if (this.pendingAvatarFetch.has(cacheKey)) {
      return;
    }

    this.pendingAvatarFetch.add(cacheKey);
    firstValueFrom(this.chatHttp.getUserById(participantId))
      .then(user => {
        const normalized = this.normalizeAvatarUrl(user.avatarUrl);
        this.applyParticipantDetails(conversationId, participantId, {
          avatarUrl: normalized ?? null,
          fullname: user.fullname ?? null,
          username: user.username ?? user.email ?? participantId,
        });
      })
      .catch(error => {
        console.error('Não foi possível carregar avatar do participante', error);
      })
      .finally(() => {
        this.pendingAvatarFetch.delete(cacheKey);
      });
  }

  private applyParticipantDetails(
    conversationId: string,
    participantId: string,
    details: {
      avatarUrl: string | null;
      fullname: string | null;
      username: string;
    }
  ): void {
    let activeUpdated = false;

    this.conversations = this.conversations.map(conversation => {
      if (conversation.id !== conversationId) {
        return conversation;
      }

      const participants = conversation.participants.map(participant =>
        participant.id === participantId
          ? {
              ...participant,
              avatarUrl: details.avatarUrl ?? participant.avatarUrl ?? null,
              fullname: details.fullname ?? participant.fullname ?? null,
              username: details.username ?? participant.username,
            }
          : participant
      );

      const normalizedConversation: ChatConversation = {
        ...conversation,
        participants,
      };

      if (this.activeConversation?.id === conversationId) {
        this.activeConversation = normalizedConversation;
        this.activeRecipient = this.getFirstParticipant(normalizedConversation);
        activeUpdated = true;
      }

      return normalizedConversation;
    });

    if (!activeUpdated && this.activeConversation?.id === conversationId) {
      const refreshed = this.conversations.find(conversation => conversation.id === conversationId);
      if (refreshed) {
        this.activeConversation = refreshed;
        this.activeRecipient = this.getFirstParticipant(refreshed);
      }
    }

    if (this.activeConversation?.id === conversationId) {
      this.messages = this.messages.map(message =>
        message.senderId === participantId
          ? {
              ...message,
              senderName: details.fullname ?? details.username ?? message.senderName,
            }
          : message
      );
    }
  }

  private normalizeConversations(conversations: ChatConversation[]): ChatConversation[] {
    return conversations.map(conversation => this.normalizeConversation(conversation));
  }

  private normalizeConversation(conversation: ChatConversation): ChatConversation {
    return {
      ...conversation,
      participants: conversation.participants.map(participant => this.normalizeParticipant(participant)),
    };
  }

  private normalizeParticipant(participant: ChatParticipant): ChatParticipant {
    const normalizedAvatar = this.normalizeAvatarUrl(participant.avatarUrl);
    return {
      ...participant,
      avatarUrl: normalizedAvatar ?? null,
      fullname: participant.fullname ?? participant.username,
    };
  }

  private normalizeAvatarUrl(avatarUrl?: string | null): string | undefined {
    if (!avatarUrl) {
      return undefined;
    }

    if (avatarUrl.startsWith('http')) {
      return avatarUrl;
    }

    return `${environment.apiUrl}${avatarUrl}`;
  }

  private resolveCurrentUserId(): string {
    const storedDirect = localStorage.getItem('id_user');
    if (storedDirect) {
      return storedDirect;
    }

    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const parsed = JSON.parse(storedUserData);
        return parsed.id_user ?? parsed.id ?? '';
      } catch (error) {
        console.warn('Não foi possível ler userData armazenado', error);
      }
    }

    return '';
  }
}