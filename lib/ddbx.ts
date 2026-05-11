interface Namable {
    name: string
}

export const ddbx = (str: TemplateStringsArray, ...values: Namable[]) => {
    if (str.length === 2) return values[0]!.name;

    let result = '';
    for (let i = 1; i < str.length; i++) result += str[i - 1] + values[i - 1]!.name;
    result += str[str.length - 1];
    return result;
}