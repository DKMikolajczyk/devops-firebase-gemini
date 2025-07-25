import { Injectable, inject } from '@angular/core';
import { getAI, getGenerativeModel, GoogleAIBackend } from '@firebase/ai';
import { environment } from '../../environment/environment';
import { Auth, user, User } from '@angular/fire/auth';
import { Observable, from, of, catchError, map, switchMap, BehaviorSubject, finalize } from 'rxjs';
import { FirebaseApp } from '@angular/fire/app';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private auth: Auth = inject(Auth);
  private firebaseApp: FirebaseApp = inject(FirebaseApp);
  private user$ = user(this.auth);
  private ai = getAI(this.firebaseApp, { backend: new GoogleAIBackend() });
  private model = getGenerativeModel(this.ai, { model: environment.gemini.modelName });

  private greetingLoading = new BehaviorSubject<boolean>(false);
  private newsLoading = new BehaviorSubject<boolean>(false);

  public greetingLoading$ = this.greetingLoading.asObservable();
  public newsLoading$ = this.newsLoading.asObservable();

  generatePersonalizedGreeting(userName: string): Observable<string> {
    this.greetingLoading.next(true);

    const currentDate = new Date();
    const hours = currentDate.getHours();

    // Determine the time of day for the greeting
    let timeOfDay = 'day';
    if (hours < 12) {
      timeOfDay = 'morning';
    } else if (hours < 18) {
      timeOfDay = 'afternoon';
    } else {
      timeOfDay = 'evening';
    }

    const prompt = `Generate an epic, personalized greeting for ${userName} in the ${timeOfDay}.
    Keep it concise (1-2 sentences) and make it sound natural in polish. Keep the nickname ${userName} as is without any changes.
    Current date: ${currentDate.toLocaleDateString()}, Current time: ${currentDate.toLocaleTimeString()}`;

    return from(this.model.generateContent([prompt]))
      .pipe(
        map(result => result.response.text()),
        catchError(error => {
          console.error('Error generating greeting:', error);
          return of(`Good ${timeOfDay}, ${userName}!`); // Fallback greeting
        }),
        finalize(() => {
          this.greetingLoading.next(false);
        })
      );
  }

  fetchLatestNews(count: number = 5): Observable<string[]> {
    this.newsLoading.next(true);

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    const prompt = `Generate ${count} short, factual news headlines that might be relevant today (${formattedDate}) for polish people.
    Format the response as a bullet point list with each headline on a new line without any preceding text!
    Include a diverse mix of global, technology, business, and health news.
    Let it be in polish and make it sound natural.
    Keep each headline concise (under 10 words).`;

    return from(this.model.generateContent([prompt]))
      .pipe(
        map(result => {
          const text = result.response.text();
          return text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .slice(0, count);
        }),
        catchError(error => {
          console.error('Error fetching news:', error);
          return of([
            'Unable to fetch the latest news at this time.',
            'Please check back later for updates.'
          ]);
        }),
        finalize(() => {
          this.newsLoading.next(false);
        })
      );
  }

  getCurrentUserGreeting(): Observable<string> {
    return this.user$.pipe(
      switchMap((user: User | null) => {
        if (user) {
          const userName = user.displayName || user.email?.split('@')[0] || 'there';
          return this.generatePersonalizedGreeting(userName);
        } else {
          return of('Please sign in to see personalized content.');
        }
      })
    );
  }
}
