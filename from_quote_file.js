const quoteSeperator = /\n----\n/;
const authorSeperator = /\n\s{4}(.*?)$/;
const emptyLine = /^(\s+)?\n+$/
const quoteFileAddress = 'quotes.txt';

const quoteBodyHTMLElement = 'quote-body';
const fromHTMLElement = 'from';
const totalHTMLElement = 'total';
const currentQuoteIndexHTMLElement = 'currentQuoteIndex';


class Quotes {

  constructor() {
    this.htmlFields = {
      quoteBody: document.getElementById(quoteBodyHTMLElement),
      from: document.getElementById(fromHTMLElement),
      total: document.getElementById(totalHTMLElement),
      currentQuoteIndex: document.getElementById(currentQuoteIndexHTMLElement),
    };
    this.url = {
      hash: '',
      args: [],
    }
    this.quoteIndex = -1;
    this.quotesContainer = [];

    this.parseUrl(window.location.href);
    this.getFile();
  }

  getFile() {

    fetch(quoteFileAddress)
    .then(response => {
      response.text().then(
        content => this.parseContent(content)
      )
    })
    .catch(e => alert("Unable to get quote file: " + e));

  }

  parseContent(content) {
    const lines = content.split(quoteSeperator);
    let len = lines.length;

    if (lines[len - 1] =~ emptyLine) {
      lines.splice(-1, 1);
      len = lines.length;
    }
    lines.forEach(item => {
      const quote = { text: '' };

      if (authorSeperator.test(item)) {
        quote.author = item.match(authorSeperator)[1].replace(/\n/, ' ');
        quote.text = item.replace(authorSeperator, '').replace(/\n/, ' ');
      } else {
        quote.text = item.replace(/\n/, ' ');
      }

      this.quotesContainer.push(quote);
    });

    this.htmlFields.total.innerText = `${this.quotesContainer.length}`;

    this.getQuote();
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  calcFontSize(textLength) {
    const baseSize = 7;

    if (textLength >= baseSize) {
      textLength = baseSize - 2;
    }

    const fontSize = baseSize - textLength;

    return `${fontSize}vw`;
  }

  getCurrentQuote() {
    return this.quotesContainer[this.quoteIndex];
  }

  getQuote() {
    let quoteNumber = null
    if (this.url.hash != '') {
      quoteNumber = parseInt(this.url.hash, 10);
    } else if (this.url.args.length > 0) {
      this.url.args.forEach( (value, name) => {
        console.log(name, value);
      } );
    }

    if (quoteNumber === null ||
        isNaN(quoteNumber) ||
          quoteNumber >= this.quotesContainer.length) {
      this.getRandomQuote();
    } else {
        this.quoteNumber = quoteNumber;
    }
    const quote = this.quotesContainer[this.quoteIndex];
    this.htmlFields.quoteBody.innerText = quote.text;
    this.htmlFields.quoteBody.style.fontSize = this.calcFontSize(quote.text.length);

    if (quote.author) {
      this.htmlFields.from.innerText = '—' + quote.author
    } else {
      this.htmlFields.from.innerText = '';
    }

    this.htmlFields.currentQuoteIndex.innerText = `${this.quoteIndex || 0}`;
    window.history.pushState({quote: this.quoteNumber}, document.head.title,
                             `?quote=${this.quoteNumber}`);
  }

  getRandomQuote() {
    this.quoteIndex = this.getRandomInt(this.quotesContainer.length);
  }

  parseUrl(urlString) {
    let url = new URL(urlString || window.location.href);
    if (url.hash != '') {
      this.url.hash = url.hash.replace('#', '');
    }

    url.searchParams.forEach((value, key) => this.url.args.push({ key, value }));
    console.log(this.url);
  }

}

const quote = new Quotes();

