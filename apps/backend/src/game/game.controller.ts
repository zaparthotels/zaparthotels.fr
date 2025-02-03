import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import type { GameService } from './game.service';
import type { Game } from './interfaces/game.interface';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Put()
  createGame(): Promise<Game> {
    const game = this.gameService.createGame();
    if (!game) {
      throw new HttpException(
        'Failed to create a game',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return game;
  }

  @Put(':numberOfGame')
  createManyGame(
    @Param('numberOfGame', ParseIntPipe) numberOfGame: number,
  ): Promise<Game[]> {
    const games = this.gameService.createManyGame(numberOfGame);
    if (!games) {
      throw new HttpException(
        `Failed to create ${numberOfGame} games`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return games;
  }

  @Get(':code')
  async getOneGame(@Param('code') code: string): Promise<Game> {
    const game = await this.gameService.findOneGame(code);
    if (!game) {
      throw new NotFoundException(`Game with code ${code} not found`);
    }
    return game;
  }

  @Get()
  async getAllGames(): Promise<Game[]> {
    const allGames = await this.gameService.findAllGames();
    if (!allGames || allGames.length === 0) {
      throw new NotFoundException('Database is empty');
    }
    return allGames;
  }

  @Delete(':code')
  async DeleteOneGame(@Param('code') code: string): Promise<object> {
    const game = await this.gameService.deleteOneGame(code);
    if (!game) {
      throw new NotFoundException(`Game with code ${code} not found`);
    }
    return {
      message: `The game ${code} has been successfully deleted`,
      statusCode: HttpStatus.OK,
    };
  }
}
