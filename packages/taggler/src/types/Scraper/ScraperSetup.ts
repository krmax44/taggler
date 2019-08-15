import { QuestionCollection } from 'inquirer';
import { ScraperValidationInput } from './ScraperValidation';

interface ScraperSetupQuestions {
	questions: QuestionCollection;
	validate?: (
		answers: ScraperValidationInput
	) => true | string | Promise<true | string>;
}

export type ScraperSetup = ScraperSetupQuestions | true;
