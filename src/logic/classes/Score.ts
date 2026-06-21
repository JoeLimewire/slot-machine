export default class Score {
    private _score: number;

    constructor() {
        this._score = 0;
    }

    get score(): number {
        return this._score;
    }

    set score(value: number) {
        this._score = value;
    }

    public addScore(value: number): void {
        // Add the score incrementally to the current score
        const time = value <= 3 ? 0 : 1000;
        const steps = Math.abs(value);
        const targetScore = this._score + value;
        const increment = value / steps;
        const interval = time / steps;

        let currentStep = 0;
        const intervalId = setInterval(() => {
            this._score += increment;
            currentStep++;
            if (currentStep >= steps) {
                clearInterval(intervalId);
                this._score = Math.round(targetScore);
            }
        }, interval);
    }

    public resetScore(): void {
        this._score = 0;
    }
}