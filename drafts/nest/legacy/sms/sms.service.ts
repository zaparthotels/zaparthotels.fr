import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { smsClient, smsQueue } from './sms.config';
import { Queue } from 'bullmq';
import { SendSmsDto } from './dto/response/send-sms.dto';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly queue: Queue;

  constructor() {
    this.queue = new Queue('sms-queue', smsQueue);
  }

  /**
   * Envoie immédiatement un SMS via le SDK.
   *
   * @param phoneNumber Le numéro de téléphone destinataire.
   * @param message Le contenu du SMS.
   */
  async sendSms(phoneNumber: string, message: string): Promise<SendSmsDto> {
    try {
      this.logger.log(
        `Envoi immédiat de SMS à ${phoneNumber} avec le message : "${message}"`,
      );
      const result = await smsClient.send({
        phoneNumbers: [phoneNumber],
        message,
        ttl: 35,
      });
      this.logger.log(`SMS envoyé : ${JSON.stringify(result)}`);

      return result;
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'envoi du SMS à ${phoneNumber}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Erreur lors de l'envoi du SMS : ${error.message || 'Erreur inconnue'}`,
      );
    }
  }

  /**
   * Planifie l'envoi d'un SMS en ajoutant une tâche à la file d'attente.
   *
   * @param phoneNumber Le numéro de téléphone destinataire.
   * @param message Le contenu du SMS.
   * @param timestamp La date à laquelle le SMS doit être envoyé.
   */
  async scheduleSms(
    phoneNumber: string,
    message: string,
    timestamp: Date,
  ): Promise<void> {
    const delay = Math.max(0, timestamp.getTime() - Date.now());
    this.logger.log(
      `Planification de l'envoi d'un SMS à ${phoneNumber} dans ${delay} ms`,
    );
    await this.queue.add(
      'send-sms',
      { phoneNumber, message },
      {
        delay,
        attempts: 8,
        backoff: {
          type: 'exponential',
          delay: 10000,
        },
      },
    );
  }
}
