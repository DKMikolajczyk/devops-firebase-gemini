import {Component, OnInit, OnDestroy} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {GeminiService} from '../services/gemini.service';
import {Subscription} from 'rxjs';
import {NgFor, NgIf} from '@angular/common';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatListModule} from '@angular/material/list';
import {MatDividerModule} from '@angular/material/divider';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatCardModule,
    MatButton,
    RouterLink,
    NgIf,
    NgFor,
    MatProgressSpinnerModule,
    MatListModule,
    MatDividerModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  newsHeadlines: string[] = [];
  newsLoading = true;
  private subscriptions: Subscription[] = [];

  constructor(private geminiService: GeminiService) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.geminiService.newsLoading$.subscribe(loading => {
        this.newsLoading = loading;
      })
    );
    this.fetchNewsHeadlines();
  }

  private fetchNewsHeadlines(): void {
    this.subscriptions.push(
      this.geminiService.fetchLatestNews().subscribe(headlines => {
        this.newsHeadlines = headlines;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
