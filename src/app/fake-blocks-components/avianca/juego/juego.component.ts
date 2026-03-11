import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, OnDestroy, signal } from '@angular/core';

@Component({
  selector: 'juego-uiplus',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './juego.component.html',
  styleUrl: './juego.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JuegoUiplusComponent implements OnDestroy {
  private readonly gameDurationSeconds = 20;
  private timerId: ReturnType<typeof setInterval> | null = null;

  public isPlaying = signal(false);
  public score = signal(0);
  public highScore = signal(0);
  public timeLeft = signal(this.gameDurationSeconds);
  public combo = signal(0);
  public targetX = signal(50);
  public targetY = signal(50);
  public targetSize = signal(88);

  public statusText = computed(() => {
    if (!this.isPlaying()) {
      if (this.timeLeft() === this.gameDurationSeconds) {
        return 'Pulsa "Empezar" y atrapa el icono tantas veces como puedas.';
      }
      return 'Partida terminada. Pulsa "Jugar otra vez" para mejorar tu marca.';
    }

    return this.timeLeft() <= 5 ? 'Ultimos segundos, no pares.' : 'Sigue asi, suma puntos y sube el combo.';
  });

  public startGame(): void {
    this.stopTimer();
    this.isPlaying.set(true);
    this.score.set(0);
    this.combo.set(0);
    this.timeLeft.set(this.gameDurationSeconds);
    this.targetSize.set(88);
    this.moveTarget();

    this.timerId = setInterval(() => {
      const next = this.timeLeft() - 1;
      if (next <= 0) {
        this.timeLeft.set(0);
        this.finishGame();
        return;
      }
      this.timeLeft.set(next);
    }, 1000);
  }

  public hitTarget(): void {
    if (!this.isPlaying()) {
      return;
    }

    const nextCombo = this.combo() + 1;
    const bonus = Math.floor(nextCombo / 4);

    this.combo.set(nextCombo);
    this.score.update((value) => value + 1 + bonus);
    this.targetSize.update((value) => Math.max(52, value - 2));
    this.moveTarget();
  }

  public ngOnDestroy(): void {
    this.stopTimer();
  }

  private finishGame(): void {
    this.isPlaying.set(false);
    this.combo.set(0);
    this.highScore.update((best) => Math.max(best, this.score()));
    this.stopTimer();
  }

  private moveTarget(): void {
    this.targetX.set(this.randomInt(8, 92));
    this.targetY.set(this.randomInt(15, 88));
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private stopTimer(): void {
    if (!this.timerId) {
      return;
    }

    clearInterval(this.timerId);
    this.timerId = null;
  }
}
