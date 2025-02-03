import { Injectable } from '@nestjs/common';
import type { Socket } from 'socket.io';

@Injectable()
export class DebateService {
  async handleDebateLogic(client: Socket, data: unknown): Promise<void> {
    console.log('Handling debate logic for client', data);

    // Exemple : logique métier pour "Débat"
    client.emit('debate-response', { result: 'Logic for Debate executed' });
  }
}
