import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OpenAiQueryInput {
  myHand: string[];
  cardsOnTable: string[];
  playedCards: string[];
  unknownCardsCount: number;
  probabilitiesByRank: Record<number, number>;
  opponentCardCount: number;
}

interface OpenAiChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class OpenAIService {
  private readonly endpoint = 'https://api.openai.com/v1/chat/completions';
  private readonly systemPrompt = 'Sei un esperto di Scopa (carte siciliane). Analizza la situazione e suggerisci la migliore carta da giocare dalla mia mano, spiegando il ragionamento strategico.';

  constructor(private readonly http: HttpClient) {}

  queryBestMove(input: OpenAiQueryInput): Observable<string> {
    const userPrompt = [
      `Carte nella mia mano: ${input.myHand.join(', ') || 'nessuna'}`,
      `Carte sul tavolo: ${input.cardsOnTable.join(', ') || 'nessuna'}`,
      `Carte gia giocate/uscite: ${input.playedCards.join(', ') || 'nessuna'}`,
      `Carte sconosciute: ${input.unknownCardsCount}`,
      `Probabilita per valore (%): ${this.formatProbabilities(input.probabilitiesByRank)}`,
      `Carte avversario: ${input.opponentCardCount}`
    ].join('\n');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${environment.openaiApiKey}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<OpenAiChatResponse>(
      this.endpoint,
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: this.systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ]
      },
      { headers }
    ).pipe(
      map((response) => response.choices?.[0]?.message?.content?.trim() || 'Nessun suggerimento disponibile.')
    );
  }

  private formatProbabilities(probabilitiesByRank: Record<number, number>): string {
    const parts: string[] = [];

    for (let rank = 1; rank <= 10; rank += 1) {
      const value = probabilitiesByRank[rank] ?? 0;
      parts.push(`${rank}: ${Math.round(value * 100)}%`);
    }

    return parts.join(' | ');
  }
}
