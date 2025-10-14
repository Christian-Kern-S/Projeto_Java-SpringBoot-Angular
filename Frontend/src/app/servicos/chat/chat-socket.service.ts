import { Injectable, NgZone } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatMessageRequest, ChatSocketEnvelope } from '../../models/chat.models';

@Injectable({ providedIn: 'root' })
export class ChatSocketService {
  private client?: Client;
  private connected = false;
  private readonly conversationStreams = new Map<string, Subject<ChatSocketEnvelope>>();
  private connectionPromise?: Promise<void>;
  private userQueueStream?: Subject<ChatSocketEnvelope>;
  private userQueueSubscription?: StompSubscription;

  constructor(private readonly zone: NgZone) {}

  connect(): Promise<void> {
    if (this.connected && this.client?.connected) {
      return Promise.resolve();
    }
    this.client = new Client({
      webSocketFactory: () => new SockJS(`${environment.apiUrl}/ws`),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {},
    });

    this.connectionPromise = new Promise((resolve, reject) => {
      this.client!.onConnect = () => {
        this.zone.run(() => {
          this.connected = true;
          resolve();
        });
      };
      this.client!.onStompError = frame => {
        reject(frame);
      };
    });

    this.client.activate();
    return this.connectionPromise;
  }

  disconnect(): void {
    if (!this.client) return;
    this.client.deactivate();
    this.connected = false;
    this.conversationStreams.forEach(stream => stream.complete());
    this.conversationStreams.clear();
    this.userQueueSubscription?.unsubscribe();
    this.userQueueSubscription = undefined;
    this.userQueueStream?.complete();
    this.userQueueStream = undefined;
  }

  subscribeToConversation(conversationId: string): Observable<ChatSocketEnvelope> {
    let stream = this.conversationStreams.get(conversationId);
    if (stream) {
      return stream.asObservable();
    }

    if (!this.client || !this.connected) {
      throw new Error('Conexão WebSocket ainda não está ativa.');
    }

    stream = new Subject<ChatSocketEnvelope>();
    this.conversationStreams.set(conversationId, stream);

    const destination = `/topic/chat.${conversationId}`;
    const subscription: StompSubscription = this.client.subscribe(destination, (message: IMessage) => {
      this.zone.run(() => {
        stream!.next(JSON.parse(message.body) as ChatSocketEnvelope);
      });
    });

    stream.subscribe({ complete: () => subscription.unsubscribe() });
    return stream.asObservable();
  }

  subscribeToUserQueue(userId: string): Observable<ChatSocketEnvelope> {
    if (!this.client || !this.connected) {
      throw new Error('Conexão WebSocket ainda não está ativa.');
    }

    if (this.userQueueStream) {
      return this.userQueueStream.asObservable();
    }

    this.userQueueStream = new Subject<ChatSocketEnvelope>();
    const destination = `/queue/users.${userId}`;
    this.userQueueSubscription = this.client.subscribe(destination, (message: IMessage) => {
      this.zone.run(() => {
        this.userQueueStream?.next(JSON.parse(message.body) as ChatSocketEnvelope);
      });
    });

    return this.userQueueStream.asObservable();
  }

  sendMessage(senderId: string, payload: ChatMessageRequest): void {
    if (!this.client || !this.connected) {
      throw new Error('Conexão WebSocket ainda não está ativa.');
    }
    this.client.publish({
      destination: `/app/chat.send.${senderId}`,
      body: JSON.stringify(payload),
    });
  }
}