import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class Beds24Service {
  private readonly logger = new Logger(Beds24Service.name);
  private readonly tokenCacheKey = 'beds24_token';

  constructor(private readonly cacheService: CacheService) {}

  /**
   * Récupère le token depuis le cache ou via l’API Beds24 si nécessaire.
   */
  async getToken(): Promise<string> {
    // Vérification du token dans le cache
    const cachedToken = await this.cacheService.getCache<string>(this.tokenCacheKey);
    if (cachedToken) {
      this.logger.log('Token récupéré depuis le cache');
      return cachedToken;
    }

    // Définition de l’URL de l’API pour récupérer le token
    const apiUrl = 'https://api.beds24.com/your_token_endpoint';
    // Ajoutez ici les paramètres ou le corps de la requête si l’API nécessite une méthode POST
    try {
      const response = await fetch(apiUrl, {
        method: 'GET', // Changez en 'POST' si besoin et ajoutez les headers/body
        // headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ param1: 'value1', param2: 'value2' }),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération du token: ${response.statusText}`);
      }
      const data = await response.json();
      const token = data.token; // Adaptez selon la structure de la réponse
      // Stockage du token dans le cache pour 3600 secondes (1 heure)
      await this.cacheService.setCache(this.tokenCacheKey, token, 3600);
      this.logger.log('Token récupéré depuis l’API et stocké dans le cache');
      return token;
    } catch (error) {
      this.logger.error('Erreur lors de la récupération du token', error);
      throw error;
    }
  }
}
