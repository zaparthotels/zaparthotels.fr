export interface IGame {
  code: string;
  status: string;
  cardGroupId?: number;
  team1?: ITeam;
  team2?: ITeam;
}

export interface ITeam {
  isConnected: boolean;
  clientId?: string;
  answer?: Record<string, IAnswer>; // Clés dynamiques correspondant aux IDs
}

export interface IAnswer {
  input1: string;
  input2: string;
  input3: string;
  input4: string;
}
