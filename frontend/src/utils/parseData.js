export default function parseData(Data){
    const date = new Date(Data);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const res = formatter.format(date);

    return res;
}