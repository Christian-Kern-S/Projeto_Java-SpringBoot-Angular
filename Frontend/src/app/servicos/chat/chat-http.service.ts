import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ChatConversation,
  ChatMessage,
  ChatMessageRequest,
} from '../../models/chat.models';
import { UsuarioModel } from '../../models/usuario.model';

interface MessagePage {
  content: ChatMessage[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class ChatHttpService {
  private readonly baseUrl = `${environment.apiUrl}/api/chat`;

  constructor(private readonly http: HttpClient) {}

  listConversations(userId: string): Observable<ChatConversation[]> {
    return this.http.get<ChatConversation[]>(`${this.baseUrl}/conversations/${userId}`);
  }

  createDirectConversation(requesterId: string, targetId: string): Observable<ChatConversation> {
    return this.http.post<ChatConversation>(
      `${this.baseUrl}/conversations/${requesterId}/direct/${targetId}`,
      {}
    );
  }

  sendMessage(senderId: string, payload: ChatMessageRequest): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.baseUrl}/messages/${senderId}`, payload);
  }

  listMessages(conversationId: string, page = 0, size = 30): Observable<MessagePage> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<MessagePage>(`${this.baseUrl}/messages/${conversationId}`, { params });
  }

  searchUsers(term: string): Observable<UsuarioModel[]> {
    const params = new HttpParams().set('value', term);
    return this.http
      .get<UsuarioModel | UsuarioModel[]>(`${environment.apiUrl}/users`, { params })
      .pipe(
        map(response => {
          if (Array.isArray(response)) {
            return response;
          }
          return response ? [response] : [];
        })
      );
  }

  deleteMessage(requesterId: string, messageId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/messages/${requesterId}/${messageId}`);
  }

  deleteConversation(requesterId: string, conversationId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/conversations/${requesterId}/${conversationId}`);
  }

  getUserById(userId: string): Observable<UsuarioModel> {
    return this.http.get<UsuarioModel>(`${environment.apiUrl}/user/${userId}`);
  }
}