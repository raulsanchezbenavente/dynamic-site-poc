import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, HostListener, OnDestroy, signal } from '@angular/core';

type Point = [number, number];

type Tetromino = {
  name: 'I' | 'O' | 'T' | 'L' | 'J' | 'S' | 'Z';
  color: number;
  rotations: Point[][];
};

type ActivePiece = {
  shape: Tetromino;
  row: number;
  col: number;
  rotation: number;
};

@Component({
  selector: 'tetris-uiplus',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tetris.component.html',
  styleUrl: './tetris.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TetrisUiplusComponent implements OnDestroy {
  private readonly rows = 18;
  private readonly cols = 10;
  private readonly baseTickMs = 520;
  private readonly minTickMs = 170;
  private readonly softDropTickMs = 35;
  private readonly clearBlinkMs = 110;
  private readonly clearBlinkCycles = 3;

  private readonly shapes: Tetromino[] = [
    {
      name: 'I',
      color: 1,
      rotations: [
        [
          [1, 0],
          [1, 1],
          [1, 2],
          [1, 3],
        ],
        [
          [0, 2],
          [1, 2],
          [2, 2],
          [3, 2],
        ],
      ],
    },
    {
      name: 'O',
      color: 2,
      rotations: [
        [
          [1, 1],
          [1, 2],
          [2, 1],
          [2, 2],
        ],
      ],
    },
    {
      name: 'T',
      color: 3,
      rotations: [
        [
          [1, 1],
          [1, 0],
          [1, 2],
          [2, 1],
        ],
        [
          [1, 1],
          [0, 1],
          [2, 1],
          [1, 2],
        ],
        [
          [1, 1],
          [1, 0],
          [1, 2],
          [0, 1],
        ],
        [
          [1, 1],
          [0, 1],
          [2, 1],
          [1, 0],
        ],
      ],
    },
    {
      name: 'L',
      color: 4,
      rotations: [
        [
          [0, 1],
          [1, 1],
          [2, 1],
          [2, 2],
        ],
        [
          [1, 0],
          [1, 1],
          [1, 2],
          [2, 0],
        ],
        [
          [0, 0],
          [0, 1],
          [1, 1],
          [2, 1],
        ],
        [
          [0, 2],
          [1, 0],
          [1, 1],
          [1, 2],
        ],
      ],
    },
    {
      name: 'J',
      color: 5,
      rotations: [
        [
          [0, 1],
          [1, 1],
          [2, 1],
          [2, 0],
        ],
        [
          [1, 0],
          [1, 1],
          [1, 2],
          [0, 0],
        ],
        [
          [0, 1],
          [0, 2],
          [1, 1],
          [2, 1],
        ],
        [
          [1, 0],
          [1, 1],
          [1, 2],
          [2, 2],
        ],
      ],
    },
    {
      name: 'S',
      color: 6,
      rotations: [
        [
          [1, 1],
          [1, 2],
          [2, 0],
          [2, 1],
        ],
        [
          [0, 1],
          [1, 1],
          [1, 2],
          [2, 2],
        ],
      ],
    },
    {
      name: 'Z',
      color: 7,
      rotations: [
        [
          [1, 0],
          [1, 1],
          [2, 1],
          [2, 2],
        ],
        [
          [0, 2],
          [1, 1],
          [1, 2],
          [2, 1],
        ],
      ],
    },
  ];

  private board = signal<number[][]>(this.createEmptyBoard());
  private current = signal<ActivePiece | null>(null);
  private timerId: ReturnType<typeof setInterval> | null = null;
  private isSoftDropping = false;
  private isClearingRows = false;
  public flashingRows = signal<number[]>([]);

  public isPlaying = signal(false);
  public isGameOver = signal(false);
  public score = signal(0);
  public level = signal(1);
  public lines = signal(0);
  public highScore = signal(0);
  public nextShape = signal<Tetromino | null>(null);

  public nextPreview = computed(() => {
    const matrix = Array.from({ length: 4 }, () => Array(4).fill(0));
    const shape = this.nextShape();

    if (!shape) {
      return matrix;
    }

    for (const [row, col] of shape.rotations[0]) {
      if (row >= 0 && row < 4 && col >= 0 && col < 4) {
        matrix[row][col] = shape.color;
      }
    }

    return matrix;
  });

  public boardView = computed(() => {
    const matrix = this.cloneBoard(this.board());
    const piece = this.current();

    if (!piece) {
      return matrix;
    }

    for (const [r, c] of piece.shape.rotations[piece.rotation]) {
      const row = piece.row + r;
      const col = piece.col + c;
      if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
        matrix[row][col] = piece.shape.color;
      }
    }

    return matrix;
  });

  public statusText = computed(() => {
    if (this.isGameOver()) {
      return 'Juego terminado. Pulsa reiniciar para otra partida.';
    }

    if (!this.isPlaying()) {
      return 'Pulsa empezar y usa: izq/der mover, abajo bajar, espacio rotar.';
    }

    return 'Tetris en marcha. Mantente vivo y limpia lineas.';
  });

  public startGame(): void {
    this.resetState();
    this.isPlaying.set(true);
    this.spawnPiece();
    this.startTimer();
  }

  public togglePause(): void {
    if (this.isGameOver()) {
      return;
    }

    if (!this.isPlaying()) {
      this.isPlaying.set(true);
      this.startTimer();
      return;
    }

    this.isPlaying.set(false);
    this.stopTimer();
  }

  public moveLeft(): void {
    if (this.isClearingRows) {
      return;
    }
    this.tryMove(0, -1);
  }

  public moveRight(): void {
    if (this.isClearingRows) {
      return;
    }
    this.tryMove(0, 1);
  }

  public softDrop(): void {
    if (!this.isPlaying() || this.isClearingRows) {
      return;
    }

    if (!this.tryMove(1, 0)) {
      void this.lockCurrentPiece();
    } else {
      this.score.update((value) => value + 1);
    }
  }

  public hardDrop(): void {
    if (!this.isPlaying() || this.isClearingRows) {
      return;
    }

    let moved = 0;
    while (this.tryMove(1, 0)) {
      moved += 1;
    }

    if (moved > 0) {
      this.score.update((value) => value + moved * 2);
    }

    void this.lockCurrentPiece();
  }

  public rotate(): void {
    if (!this.isPlaying() || this.isClearingRows) {
      return;
    }

    const piece = this.current();
    if (!piece) {
      return;
    }

    const nextRotation = this.getCounterClockwiseRotationIndex(piece);
    const kicks = [0, -1, 1, -2, 2];

    for (const kick of kicks) {
      if (this.canPlace(piece.row, piece.col + kick, piece.shape, nextRotation)) {
        this.current.set({ ...piece, col: piece.col + kick, rotation: nextRotation });
        return;
      }
    }
  }

  private getCounterClockwiseRotationIndex(piece: ActivePiece): number {
    const currentPoints = piece.shape.rotations[piece.rotation];
    const rotatedPoints = this.normalizePoints(this.rotatePointsCounterClockwise(currentPoints));

    const nextIndex = piece.shape.rotations.findIndex((points, index) => {
      if (index === piece.rotation) {
        return false;
      }

      const candidate = this.normalizePoints(points);
      return this.arePointSetsEqual(candidate, rotatedPoints);
    });

    if (nextIndex !== -1) {
      return nextIndex;
    }

    // Safety fallback in case a shape definition is incomplete.
    return (piece.rotation - 1 + piece.shape.rotations.length) % piece.shape.rotations.length;
  }

  private rotatePointsCounterClockwise(points: Point[]): Point[] {
    return points.map(([row, col]) => [3 - col, row]);
  }

  private normalizePoints(points: Point[]): Point[] {
    let minRow = Number.POSITIVE_INFINITY;
    let minCol = Number.POSITIVE_INFINITY;

    for (const [row, col] of points) {
      if (row < minRow) minRow = row;
      if (col < minCol) minCol = col;
    }

    return points
      .map(([row, col]) => [row - minRow, col - minCol] as Point)
      .sort((a, b) => (a[0] - b[0] !== 0 ? a[0] - b[0] : a[1] - b[1]));
  }

  private arePointSetsEqual(left: Point[], right: Point[]): boolean {
    if (left.length !== right.length) {
      return false;
    }

    for (let i = 0; i < left.length; i += 1) {
      if (left[i][0] !== right[i][0] || left[i][1] !== right[i][1]) {
        return false;
      }
    }

    return true;
  }

  @HostListener('window:keydown', ['$event'])
  public onKeydown(event: KeyboardEvent): void {
    const isGameControlKey =
      event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.code === 'Space';

    if (isGameControlKey) {
      event.preventDefault();
    }

    if (!this.isPlaying() || this.isGameOver() || this.isClearingRows) {
      return;
    }

    if (event.key === 'ArrowLeft') {
      this.moveLeft();
      return;
    }

    if (event.key === 'ArrowRight') {
      this.moveRight();
      return;
    }

    if (event.key === 'ArrowDown') {
      if (event.repeat) {
        return;
      }
      if (!this.isSoftDropping) {
        this.isSoftDropping = true;
        this.startTimer();
      }
      this.softDrop();
      return;
    }

    if (event.code === 'Space') {
      this.rotate();
    }
  }

  @HostListener('window:keyup', ['$event'])
  public onKeyup(event: KeyboardEvent): void {
    if (event.key !== 'ArrowDown' || !this.isSoftDropping) {
      return;
    }

    this.isSoftDropping = false;
    if (this.isPlaying() && !this.isGameOver()) {
      this.startTimer();
    }
  }

  public ngOnDestroy(): void {
    this.stopTimer();
  }

  public trackByIndex(index: number): number {
    return index;
  }

  public isRowFlashing(rowIndex: number): boolean {
    return this.flashingRows().includes(rowIndex);
  }

  private tick(): void {
    if (!this.isPlaying() || this.isClearingRows) {
      return;
    }

    if (!this.tryMove(1, 0)) {
      void this.lockCurrentPiece();
    }
  }

  private tryMove(deltaRow: number, deltaCol: number): boolean {
    if (!this.isPlaying()) {
      return false;
    }

    const piece = this.current();
    if (!piece) {
      return false;
    }

    const nextRow = piece.row + deltaRow;
    const nextCol = piece.col + deltaCol;

    if (!this.canPlace(nextRow, nextCol, piece.shape, piece.rotation)) {
      return false;
    }

    this.current.set({ ...piece, row: nextRow, col: nextCol });
    return true;
  }

  private async lockCurrentPiece(): Promise<void> {
    if (this.isClearingRows) {
      return;
    }

    const piece = this.current();
    if (!piece) {
      return;
    }

    const matrix = this.cloneBoard(this.board());
    for (const [r, c] of piece.shape.rotations[piece.rotation]) {
      const row = piece.row + r;
      const col = piece.col + c;
      if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
        matrix[row][col] = piece.shape.color;
      }
    }

    this.board.set(matrix);
    this.current.set(null);

    const wasSoftDropping = this.isSoftDropping;
    this.isSoftDropping = false;
    await this.clearLines();
    this.spawnPiece();

    if (wasSoftDropping && this.isPlaying() && !this.isGameOver()) {
      this.startTimer();
    }
  }

  private async clearLines(): Promise<void> {
    const matrix = this.cloneBoard(this.board());
    const fullRows: number[] = [];

    for (let index = 0; index < matrix.length; index += 1) {
      if (matrix[index].every((cell) => cell !== 0)) {
        fullRows.push(index);
      }
    }

    const removed = fullRows.length;

    if (removed === 0) {
      return;
    }

    this.isClearingRows = true;
    try {
      for (let cycle = 0; cycle < this.clearBlinkCycles; cycle += 1) {
        this.flashingRows.set(fullRows);
        await this.delay(this.clearBlinkMs);
        this.flashingRows.set([]);
        await this.delay(this.clearBlinkMs);
      }

      const pending = matrix.filter((_, index) => !fullRows.includes(index));
      const clearedRows = Array.from({ length: removed }, () => Array(this.cols).fill(0));
      this.board.set([...clearedRows, ...pending]);

      const scoreByLines = [0, 100, 300, 500, 800];
      this.lines.update((value) => value + removed);
      this.score.update((value) => value + scoreByLines[removed] * this.level());

      const nextLevel = Math.min(10, Math.floor(this.lines() / 10) + 1);
      if (nextLevel !== this.level()) {
        this.level.set(nextLevel);
        if (this.isPlaying()) {
          this.startTimer();
        }
      }
    } finally {
      this.flashingRows.set([]);
      this.isClearingRows = false;
    }
  }

  private spawnPiece(): void {
    const shape = this.nextShape() ?? this.randomShape();
    this.nextShape.set(this.randomShape());

    const candidate: ActivePiece = {
      shape,
      row: -1,
      col: Math.floor(this.cols / 2) - 2,
      rotation: 0,
    };

    if (!this.canPlace(candidate.row, candidate.col, candidate.shape, candidate.rotation)) {
      this.gameOver();
      return;
    }

    this.current.set(candidate);
  }

  private canPlace(row: number, col: number, shape: Tetromino, rotation: number): boolean {
    const matrix = this.board();

    for (const [r, c] of shape.rotations[rotation]) {
      const nextRow = row + r;
      const nextCol = col + c;

      if (nextCol < 0 || nextCol >= this.cols || nextRow >= this.rows) {
        return false;
      }

      if (nextRow >= 0 && matrix[nextRow][nextCol] !== 0) {
        return false;
      }
    }

    return true;
  }

  private startTimer(): void {
    this.stopTimer();
    const normalSpeed = Math.max(this.minTickMs, this.baseTickMs - (this.level() - 1) * 40);
    const speed = this.isSoftDropping ? this.softDropTickMs : normalSpeed;
    this.timerId = setInterval(() => this.tick(), speed);
  }

  private stopTimer(): void {
    if (!this.timerId) {
      return;
    }

    clearInterval(this.timerId);
    this.timerId = null;
  }

  private resetState(): void {
    this.stopTimer();
    this.isSoftDropping = false;
    this.board.set(this.createEmptyBoard());
    this.current.set(null);
    this.nextShape.set(this.randomShape());
    this.score.set(0);
    this.level.set(1);
    this.lines.set(0);
    this.isGameOver.set(false);
  }

  private gameOver(): void {
    this.isSoftDropping = false;
    this.flashingRows.set([]);
    this.isClearingRows = false;
    this.isPlaying.set(false);
    this.isGameOver.set(true);
    this.stopTimer();
    this.highScore.update((best) => Math.max(best, this.score()));
  }

  private createEmptyBoard(): number[][] {
    return Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
  }

  private cloneBoard(board: number[][]): number[][] {
    return board.map((row) => [...row]);
  }

  private randomShape(): Tetromino {
    return this.shapes[Math.floor(Math.random() * this.shapes.length)];
  }

  private async delay(ms: number): Promise<void> {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
