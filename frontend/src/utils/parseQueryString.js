export default function parseQueryString(search) {
    return (search || "")
        .replace(/^\?/g, "")
        .split("&")
        .reduce(function (acc, query) {
            const parts = query.split("=");
            const key = parts[0];
            const value = parts[1];

            if (key) {
                acc[key] = decodeURIComponent(value);
            }

            return acc;
        }, {});
}