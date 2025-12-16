
// Basic Levenshtein distance algorithm
export function levenshtein(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

// A subset of common English words for client-side spell checking
const COMMON_WORDS_RAW = `
the be to of and a in that have i it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us
window windows system computer file open close save edit view help insert format tools table window help
hello writing calendar privilege independent receive address occurred separate definitely
government accommodate misspell publicly essentially necessary tomorrow unfortunately
familiar usually actually probably finally really simple complex example quick slow
start stop begin end create delete update read write move copy paste cut select
print share export import download upload login logout account profile settings
options preferences formatting paragraph character style theme layout design
header footer page number margin orientation portrait landscape size indent
align left center right justify bold italic underline strikethrough subscript superscript
font size color highlight background border padding spacing line break section
document folder project dashboard recent favorite trash archive template
search replace find match case whole word regex navigation outline references
review comment track changes revisions accept reject previous next
zoom view mode print layout web layout draft outline full screen
ruler grid guides snap to grid guidelines object shape text box
image picture photo figure drawing chart graph smartart
table row column cell merge split distribute sort formula properties
link hyperlink bookmark cross-reference citation caption footnote endnote
symbol equation special character date time field variable
automatic manual default custom user system global local
application program software hardware memory storage network internet
connection online offline sync data backup restore security privacy
login password username email address phone number contact
support help documentation tutorial guide faq feedback
license version update upgrade install uninstall patch release
feature bug error warning info success unknown null undefined
true false boolean integer string number object array function
class interface type enum module package library framework
component element node parent child sibling ancestor descendant
event handler listener callback key mouse click hover scroll
drag drop focus blur change input submit form fieldset legend
label button checkbox radio select option textarea canvas video audio
frame iframe embed object param source track map area
meta link style script head body title html div span p
h1 h2 h3 h4 h5 h6 ul ol li dl dt dd table tr td th
img a pre code blockquote hr br b i u s small big
sub sup em strong mark del ins q cite abbr acronym
address time progress meter details summary dialog menu menuitem
header footer main section article aside nav figure figcaption
div span applet object embed map area script noscript
style link meta base title head html body
width height top bottom left right position display visibility
overflow z-index float clear margin padding border outline
background color font text-align text-decoration text-transform
white-space word-break word-wrap text-overflow overflow-wrap
cursor pointer default help wait progress crosshair text vertical-text
alias copy move no-drop not-allowed grab grabbing all-scroll
col-resize row-resize n-resize e-resize s-resize w-resize
ne-resize nw-resize se-resize sw-resize ew-resize ns-resize
nesw-resize nwse-resize zoom-in zoom-out
`;

const COMMON_WORDS_LIST = COMMON_WORDS_RAW.split(/\s+/).filter(w => w.length > 0);

const DICTIONARY = new Set(COMMON_WORDS_LIST);

export const spellChecker = {
    check(word: string): boolean {
        if (word.length < 3) return true;
        if (/\d/.test(word)) return true;

        const lower = word.toLowerCase();
        return DICTIONARY.has(lower);
    },

    suggest(word: string): string | null {
        const lower = word.toLowerCase();
        if (DICTIONARY.has(lower)) return null;

        let bestMatch: string | null = null;
        let minDistance = 3;

        // Optimization: only check words with similar length
        const length = lower.length;

        for (const correctWord of DICTIONARY) {
            if (Math.abs(correctWord.length - length) > 2) continue;

            const dist = levenshtein(lower, correctWord);
            if (dist < minDistance) {
                minDistance = dist;
                bestMatch = correctWord;
            }
        }

        return bestMatch;
    }
};
