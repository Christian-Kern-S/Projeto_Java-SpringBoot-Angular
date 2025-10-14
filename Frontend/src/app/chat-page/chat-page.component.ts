import { Component } from '@angular/core';

interface ChatContact{
  id: number;
  name: string;
  status: string;
  lastMessage: string;
  avatar: string;
  unread?: number;
  pinned?: boolean;
}

interface ChatMessage{
  id: number;
  author: 'me' | 'other';
  text: string;
  time: string;
  poll?: {
    question: string;
    options: Array<{
      label: string;
      percentage:number;
      selected?: boolean;
    }>
  }
}

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.css'
})
export class ChatPageComponent {
  contacts: ChatContact[] = [
    { id: 1, name: 'Designers', status: '9 membros', lastMessage: 'Sure !!', avatar: 'assets/avatars/group.png', pinned: true },
    { id: 2, name: 'Bessie Cooper', status: 'Online', lastMessage: 'I have something to tell you', avatar: 'assets/avatars/bessie.png', pinned: true, unread: 2 },
    { id: 3, name: 'Darrell', status: 'Offline', lastMessage: 'The curation 💜', avatar: 'assets/avatars/darrell.png', pinned: true },
    { id: 4, name: 'Leslie Alexander', status: 'They are jogging', lastMessage: '12:45', avatar: 'assets/avatars/leslie.png' },
    { id: 5, name: 'Guy Hawkins', status: 'He owes a car', lastMessage: '09:12', avatar: 'assets/avatars/guy.png', unread: 1 },
    { id: 6, name: 'Jacob Jones', status: 'I usually swim for two hours.', lastMessage: '07:05', avatar: 'assets/avatars/jacob.png' },
  ]

  activeContact = this.contacts[0]
  showDetails = true

  messages: ChatMessage[] = [
    { id: 1, author: 'other', text: "Let's vote for better option", time: '02:32' },
    {
      id: 2,
      author: 'other',
      text: 'Are you satisfied with this design option ?',
      time: '02:32',
      poll: {
        question: 'Are you satisfied with this design option ?',
        options: [
          { label: 'Satisfied', percentage: 40, selected: true },
          { label: 'Not Satisfied', percentage: 60 },
        ],
      },
    },
    { id: 3, author: 'me', text: 'I hope we finish tomorrow', time: '02:32' },
    { id: 4, author: 'other', text: 'Sure !!', time: '02:32' },
  ];

  selectContact(contact: ChatContact): void {
    this.activeContact = contact
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails
  }

}
