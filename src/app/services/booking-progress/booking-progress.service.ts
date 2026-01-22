import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class BookingProgressService {
    private localStorageKey = 'BOOKING_PROCESS';
    private router = inject(Router);

    private steps: Map<string, boolean> = new Map([
        ['home', false],
        ['results', false],
        ['baggage-selection', false],
        ['seatmap', false],
        ['payment', false],
        ['payment-success', false],
    ]);

    private readonly order = [
        'home',
        'results',
        'baggage-selection',
        'seatmap',
        'payment',
        'payment-success'
    ];

    constructor() {
        this.loadProgressFromStorage();
    }

    private loadProgressFromStorage(): void {
        const data = localStorage.getItem(this.localStorageKey);
        if (data) {
            try {
                const parsed = JSON.parse(data);
                this.steps = new Map(Object.entries(parsed));
            } catch {
                console.warn('Invalid booking progress data in localStorage');
            }
        }
    }

    private saveProgressToStorage(): void {
        const obj = Object.fromEntries(this.steps);
        localStorage.setItem(this.localStorageKey, JSON.stringify(obj));
    }

    public completeStep(path: string): void {
        if (this.steps.has(path)) {
            this.steps.set(path, true);
            this.saveProgressToStorage();
        }
    }

    public canAccess(path: string): boolean {
        const index = this.order.indexOf(path);
        if (index === -1) return false;

        return this.order.slice(0, index).every(step => this.steps.get(step));
    }

    public resetProgress(): void {
        this.steps.forEach((_, key) => this.steps.set(key, false));
        this.saveProgressToStorage();
    }

    // API service methods
    public initToken(): Promise<string> {
        const storedToken = localStorage.getItem('BOOKING_PROCESS');
        if (storedToken) {
            return Promise.resolve(storedToken);
        }

        return fetch('http://localhost:3000/start', {
            method: 'POST'
        })
        .then(res => {
            if (!res.ok) {
            throw new Error(`Failed to start: HTTP ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            localStorage.setItem('BOOKING_PROCESS', data.token);
            return data.token;
        });
    }

    public markBookingProcessAsCompleted(completeSection: string, goTo?: string): void {
        const token = localStorage.getItem('BOOKING_PROCESS');
        fetch('http://localhost:3000/completeStep/' + completeSection, {
            method: 'POST',
            headers: {
                Authorization: token ?? ''
            }
        }).then((response) => {
            if (!response.ok) {
                this.initToken().then(() => {
                    this.markBookingProcessAsCompleted(completeSection, goTo);
                });
            }

            if (goTo) {
                this.router.navigate([goTo]);
            }
        });
    }

    public finishBookingProcess(): void {
        const token = localStorage.getItem('purchaseToken');
        fetch(`http://localhost:3000/destroy/${token}`, {
            method: 'DELETE'
        }).then(res => res.json()).then(() => {
            localStorage.removeItem('purchaseToken');
            this.router.navigate(['/home']);
        });
    }
}
