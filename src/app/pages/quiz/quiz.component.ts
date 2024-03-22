import { Component, OnInit } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
})
export class QuizComponent implements OnInit {
  showWarning: boolean = false;

  isQuizStarted: boolean = false;
  isQuizEnded: boolean = false;
  questionsList: any[] = [];
  currentQuestionNo: number = 0;

  remainingTime: number = 120;

  timer = interval(1000);
  timerSubscription!: Subscription;
  correctAnswerCount: number = 0;

  formattedTime: string = '00:00';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions() {
    this.http.get('assets/questions.json').subscribe((res: any) => {
      this.questionsList = res;
    });
  }

  showWarningPopup() {
    this.showWarning = true;
  }

  startQuiz() {
    this.showWarning = false;
    this.isQuizStarted = true;
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.remainingTime !== 0) {
        this.remainingTime--;
        this.formattedTime = this.formatTime(this.remainingTime);
      } else {
        this.nextQuestion();
      }
    });
  }

  selectOption(option: any) {
    if (option.isCorrect) {
      this.correctAnswerCount++;
    }
    option.isSelected = true;
  }

  isOptionSelected(options: any) {
    return options.some((option: any) => option.isSelected);
  }

  nextQuestion() {
    this.remainingTime = 120;
    if (this.currentQuestionNo + 1 !== this.questionsList.length) {
      this.currentQuestionNo++;
    } else {
      this.timerSubscription.unsubscribe();
    }
  }

  finish() {
    this.isQuizEnded = true;
    this.isQuizStarted = false;
  }

  start() {
    this.currentQuestionNo = 0;
    this.correctAnswerCount = 0;
    this.showWarning = false;
    this.isQuizEnded = false;
    this.isQuizStarted = false;
    this.loadQuestions();
  }

  private formatTime(time: number): string {
    const minutes: string = Math.floor(time / 60)
      .toString()
      .padStart(2, '0');
    const seconds: string = (time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}
