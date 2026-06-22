export default class Score {
    private _score: number;

    constructor() {
        this._score = 0;
    }

    public get score(): number {
        return Math.round(this._score);
    }

    set score(value: number) {
        this._score = value;
    }

    private _targetScore = 0;
    private _intervalId: ReturnType<typeof setInterval> | null = null;

    public addScore(value: number): void {
        this._targetScore += value;

        if (this._intervalId !== null) return;

        const tickMs = 16;
        this._intervalId = setInterval(() => {
            const remaining = this._targetScore - this._score;

            if (Math.abs(remaining) < 0.5) {
                this._score = this._targetScore;
                clearInterval(this._intervalId!);
                this._intervalId = null;
                return;
            }

            this._score += remaining * 0.08;
        }, tickMs);
    }

    public resetScore(): void {
        this._score = 0;
    }
}
