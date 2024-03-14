console.log("钟意祝你有个美好的一天!");

// 黑暗主题提前量
let firstT = window.localStorage.getItem('ZYI_Theme_Mode')
if (firstT === 'dark' || (firstT === 'Moss' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.querySelector("html").id = "ZYDark";
} else if (firstT === 'light' || (firstT === 'Moss' && !window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.querySelector("html").id = "ZYLight";
} else {
    document.querySelector("html").id = "ZYDark";
    window.localStorage.setItem('ZYI_Theme_Mode', 'dark');
}