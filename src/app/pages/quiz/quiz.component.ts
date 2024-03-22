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
  subscription: Subscription[] = [];
  correctAnswerCount: number = 0;

  formattedTime: string = '00:00';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions() {
    this.http.get('assets/questions.json').subscribe((res: any) => {
      // debugger;
      this.questionsList = res;
    });
  }

  showWarningPopup() {
    this.showWarning = true;
  }

  startQuiz() {
    this.showWarning = false;
    this.isQuizStarted = true;
    this.subscription.push(
      this.timer.subscribe((res) => {
        if (this.remainingTime != 0) {
          this.remainingTime--;
          this.formattedTime = this.formatTime(this.remainingTime);
        }
        if (this.remainingTime == 0) {
          this.nextQuestion();
        }
      })
    );
  }

  selectOption(option: any) {
    if (option.isCorrect) {
      this.correctAnswerCount++;
    }
    option.isSelected = true;
  }

  isOptionSelected(options: any) {
    const selectionCount = options.filter(
      (m: any) => m.isSelected == true
    ).length;
    if (selectionCount == 0) {
      return false;
    } else {
      return true;
    }
  }

  nextQuestion() {
    this.remainingTime = 120;
    if (this.currentQuestionNo + 1 !== this.questionsList.length) {
      this.currentQuestionNo++;
    } else {
      this.subscription.forEach((element) => {
        element.unsubscribe();
      });
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
}
