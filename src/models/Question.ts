import { Choice, CreateChoiceDTO } from './Choice';

export interface Question {
    id: number;
    exam_id: number;
    statement: string;
    points: number;
}

export interface CreateQuestionDTO {
    exam_id: number;
    statement: string;
    points: number;
    choices: CreateChoiceDTO[];
}

export interface UpdateQuestionDTO {
    statement?: string;
    points?: number;
}

export interface QuestionForStudent {
    id: number;
    statement: string;
    points: number;
    choices: {
        id: number;
        text: string;
    }[];
}

export interface QuestionForAdmin extends Question {
    choices: Choice[];
}