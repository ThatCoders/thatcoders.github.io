/**
 * 监听系统主题
 * @type {MediaQueryList}
 */
var OSTheme = window.matchMedia('(prefers-color-scheme: dark)');
OSTheme.addListener(e => {
    if (window.localStorage.getItem('ZYI_Theme_Mode') === 'Moss') {
        ThemeChange('Moss');
    }
})
const getSwitch = (num) => {return document.querySelector(`#start > aside > div > footer > div > a:nth-child(${num})`)}
/**
 * 修改博客主题
 * @param theme 亮为light,暗为dark,自动为auto
 * @constructor document.querySelector("#start > aside > div > footer > div > a:nth-child(5)")
 */
const ThemeChange = (theme) => {
    if (theme === 'light' || (theme === 'Moss' && !OSTheme.matches)) {
        document.querySelector("html").id = "ZYLight";
        getSwitch(6).style.filter = 'grayscale(0%)';
        getSwitch(5).style.filter = 'grayscale(100%)';
    } else {
        document.querySelector("html").id = "ZYDark";
        getSwitch(5).style.filter = 'grayscale(0%)';
        getSwitch(6).style.filter = 'grayscale(100%)';
    }
    if (theme === 'Moss') {
        getSwitch(7).style.filter = 'grayscale(0%)';
    } else {
        getSwitch(7).style.filter = 'grayscale(100%)';
    }
    window.localStorage.setItem('ZYI_Theme_Mode', theme);
}
/**
 * 初始化博客主题
 */
switch (window.localStorage.getItem('ZYI_Theme_Mode')) {
    case 'light':
        ThemeChange('light');
        break;
    case 'dark':
        ThemeChange('dark');
        break;
    default:
        ThemeChange('Moss');
}

/**
 * 切换主题模式
 */
getSwitch(5).onclick = () => {
    ThemeChange('dark');
}
getSwitch(6).onclick = () => {
    ThemeChange('light');
}
getSwitch(7).onclick = () => {
    ThemeChange('Moss');
}

