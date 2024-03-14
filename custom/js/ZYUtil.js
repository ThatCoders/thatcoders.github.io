/**
 * 钟意工具类
 */
const ZYUtil =  {
    /**
     * 判断目前路径
     * @returns {boolean|string} 当前位置 e.g.(wiki, notes)
     */
    isWhere: () => {
        const urls = window.location.href.split('/');
        return urls.length < 4 ? false : urls[3]
    },
    /**
     * wiki显示省略头部
     */
    wikiHeader: (isWiki) => {
        if (isWiki) {
            const parentElement = document.querySelector("#start > aside");
            if (parentElement.firstElementChild.tagName !== "HEADER"){
                const HeaderElement = document.createElement('header');
                HeaderElement.innerHTML = `
                    <div class="logo-wrap" style="margin: 0;">
                      <a class="avatar" href="/about/">
                        <div class="bg" style="opacity: 0; background-image: url(https://fastly.jsdelivr.net/gh/cdn-x/placeholder@1.0.4/avatar/round/rainbow64@3x.webp);"></div>
                        <img no-lazy="" class="avatar lazy entered loaded" src="https://upyun.thatcdn.cn/hexo/stellar/image/favicon.webp" data-src="https://upyun.thatcdn.cn/hexo/stellar/image/favicon.webp" onerror="javascript:this.classList.add('error');this.src='https://fastly.jsdelivr.net/gh/cdn-x/placeholder@1.0.4/image/2659360.svg';" data-ll-status="loaded">
                      </a>
                      <a class="title" href="/">
                        <div class="main" ff="title">钟意博客</div>
                        <div class="sub normal cap"><i class="fa-solid fa-chess-queen"></i> 钟意的数字花园</div>
                        <div class="sub hover cap" style="opacity: 0"> ThatCoder's Blog 钟意博客</div>
                      </a>
                    </div>
                `;
                HeaderElement.classList.add("header");
                parentElement.insertBefore(HeaderElement, parentElement.firstChild);
            }
        }
    }
}

// wiki显示省略头部
// ZYUtil.wikiHeader(ZYUtil.isWhere() === "wiki")
