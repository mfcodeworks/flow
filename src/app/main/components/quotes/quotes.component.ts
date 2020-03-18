import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { environment } from 'src/environments/environment';
interface IQuote {
    quote: string;
    author: string;
}

@Component({
    selector: 'app-quotes',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './quotes.component.html',
    styleUrls: ['./quotes.component.scss']
})
export class QuotesComponent implements OnInit {
    quote: string;
    author: string;

    ngOnInit() {
        let { quote, author } = this.shuffle(environment.runes)[0]
        this.quote = quote;
        this.author = author;
    }

    shuffle(a: IQuote[]): IQuote[] {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

}
