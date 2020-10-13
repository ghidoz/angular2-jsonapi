const replace = String.prototype.replace;
const percentTwenties = /%20/g;

import util from './utils';

const Format = {
    RFC1738: 'RFC1738',
    RFC3986: 'RFC3986'
};

export default util.assign(
    {
        default: Format.RFC3986,
        formatters: {
            RFC1738(value) {
                return replace.call(value, percentTwenties, '+');
            },
            RFC3986(value) {
                return String(value);
            }
        }
    },
    Format
);
