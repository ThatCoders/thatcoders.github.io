/*
 * Copyright (c) 2024.
 * ZYDark.js files written in 2024/5/11 上午8:56 are ThatCoder (钟意) for MyBlog projects.
 * ThatCoder's blog is https://blog.thatcoder.cn
 * If you are interested in this code or have any questions, you are welcome to visit and discuss it.
 */

/**
 * 监听系统主题
 * @type {MediaQueryList}
 */
var OSTheme = window.matchMedia('(prefers-color-scheme: dark)');
OSTheme.addListener(e => {
    if (document.documentElement.getAttribute('data-theme') === 'auto') {
        ThemeChange('auto');
    }
})
var getSwitch = (num) => {return document.querySelector(`#start > aside > div > footer > div > a:nth-child(${num})`)}
/**
 * 修改博客主题
 * @param theme 亮为light,暗为dark,自动为auto
 * @param init 是否是初始化
 * @constructor document.querySelector("#start > aside > div > footer > div > a:nth-child(5)")
 */
var ThemeChange = (theme, init = false) => {
    // 切换主题模式，light -> dark -> auto -> light
    // const theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'light' || (theme === 'auto' && !OSTheme.matches)) {
        // document.querySelector("html").id = "ZYLight";
        document.documentElement.setAttribute('data-theme', init? 'light':'auto');
        getSwitch(7).style.filter = 'grayscale(0%)';
        getSwitch(6).style.filter = 'grayscale(100%)';
    } else {
        document.documentElement.setAttribute('data-theme', init?'dark':'light');
        getSwitch(6).style.filter = 'grayscale(0%)';
        getSwitch(7).style.filter = 'grayscale(100%)';
    }
    if (theme === 'auto') {
        document.documentElement.setAttribute('data-theme', init?OSTheme.matches?'dark':'light':'dark');
        getSwitch(8).style.filter = 'grayscale(0%)';
    } else {
        getSwitch(8).style.filter = 'grayscale(100%)';
    }
    init ? console.log("钟意祝你有个美好的一天!") : switchTheme();
}
/**
 * 初始化博客主题
 */
ThemeChange(window.localStorage.getItem('Stellar.theme'), true);
getSwitch(1).style.filter = 'grayscale(0%)';
getSwitch(5).style.filter = 'grayscale(0%)';

