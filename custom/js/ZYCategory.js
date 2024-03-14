/* 定义文章样式 */
//文章样式
let ThisCategory = '未分类';
try {
    //尝试获取文章样式
    ThisCategory = document.querySelector("#breadcrumb > a:nth-child(5)").text;
} catch (e) {
}
if (ThisCategory !== '未分类') {
    switch (ThisCategory) {
        case '第九艺术':
            document.querySelector("#start > div > article > h1").style.display = 'none';
            document.querySelector("#start > div > article > div:nth-child(3)").style.textAlign = 'center';
            break;
        default:
            break;
    }
}