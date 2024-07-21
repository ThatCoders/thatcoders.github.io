var customNum = {}
const Time_template = {
    reactions: {
        '+1': '👍',
        '-1': '👎',
        'laugh': '😀',
        'hooray': '🎉',
        'confused': '😕',
        'heart': '❤️',
        'rocket': '🚀',
        'eyes': '👀'
    },
    requestAPI: function (url, callback, timeout) {
        let retryTimes = 5;

        function request() {
            return new Promise((resolve, reject) => {
                let status = 0; // 0 等待 1 完成 2 超时
                let timer = setTimeout(() => {
                    if (status === 0) {
                        status = 2;
                        timer = null;
                        reject('请求超时');
                        if (retryTimes == 0) {
                            timeout();
                        }
                    }
                }, 5000);
                fetch(url).then(function (response) {
                    if (status !== 2) {
                        clearTimeout(timer);
                        resolve(response);
                        timer = null;
                        status = 1;
                    }
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error('Network response was not ok.');
                }).then(function (data) {
                    retryTimes = 0;
                    callback(data);
                }).catch(function (error) {
                    if (retryTimes > 0) {
                        retryTimes -= 1;
                        setTimeout(() => {
                            request();
                        }, 8000);
                    } else {
                        timeout();
                    }
                });
            });
        }

        request();
    },
    waitStyle: function (wait = true, el = null) {
        if (wait) {
            const load = document.createElement('div')
            load.classList.add('loading-wrap')
            load.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"><path stroke-dasharray="60" stroke-dashoffset="60" stroke-opacity=".3" d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="1.3s" values="60;0"/></path><path stroke-dasharray="15" stroke-dashoffset="15" d="M12 3C16.9706 3 21 7.02944 21 12"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="15;0"/><animateTransform attributeName="transform" dur="1.5s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></path></g></svg>'
            el.append(load)
        } else {
            el.querySelectorAll('.loading-wrap svg').forEach(function (svgElement) {
                svgElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="60" stroke-dashoffset="60" d="M12 3L21 20H3L12 3Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.5s" values="60;0"/></path><path stroke-dasharray="6" stroke-dashoffset="6" d="M12 10V14"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="6;0"/></path></g><circle cx="12" cy="17" r="1" fill="currentColor" fill-opacity="0"><animate fill="freeze" attributeName="fill-opacity" begin="0.8s" dur="0.4s" values="0;1"/></circle></svg>`
                svgElement.parentElement.classList.add('error')
            });
            // el.querySelector('.loading-wrap').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="60" stroke-dashoffset="60" d="M12 3L21 20H3L12 3Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.5s" values="60;0"/></path><path stroke-dasharray="6" stroke-dashoffset="6" d="M12 10V14"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="6;0"/></path></g><circle cx="12" cy="17" r="1" fill="currentColor" fill-opacity="0"><animate fill="freeze" attributeName="fill-opacity" begin="0.8s" dur="0.4s" values="0;1"/></circle></svg>`;
        }
    },
    layoutDiv: function (cfg) {
        const el = cfg.el;
        el.childNodes[0].remove()   // 配置即用即删
        this.requestAPI(cfg.data.api, function (data) {
            el.querySelector('.loading-wrap').remove();
            let config =
                TmplConfig.tmpl.includes(cfg.type) ?
                    TmplConfig[cfg.type] :
                    (TmplConfig.tmpl.includes(cfg.data.type) ? TmplConfig[cfg.data.type] : cfg.data);
            const identifier = cfg.id;
            customNum[identifier] = Object.keys(customNum).includes(identifier) ? customNum[identifier] : {
                'num': cfg.num,
                'now': 0,
                'data': []
            }
            let configObjects = Matcher.forMain(data, config)
            customNum[identifier]['data'] = customNum[identifier]['data'].concat(configObjects);    //  聚合压栈
            customNum[identifier]['now']++
            if (customNum[identifier]['now'] === customNum[identifier]['num']) {   // 聚合已满出栈
                configObjects = customNum[identifier]['data'];
                console.log("聚合已满出栈"+identifier, configObjects)
                configObjects = Matcher.commandSort(configObjects, config, customNum[identifier])  // 时间序列化 TODO: 优化默认排序算法
                for (const configObject of configObjects) {
                    el.append(TempStyle.getTimeNode(configObject));
                }
                // $(el).append(TempStyle.getFloatStyle())
                delete customNum[identifier]  // 防止赛博诈尸
            }
        }, function () {
            Time_template.waitStyle(false, cfg.el)
        });
    },
}

function timetmpl() {
// 获取 timetmpl 集合
    const els = document.getElementsByClassName('timetmpl');
    for (let i = 0; i < els.length; i++) {
        let el = els[i];
        const elNodes = Array.from(el.childNodes);  // 聚合原始数据（解绑）
        const id = Date.now().toString();  // 聚合动态标识符
        for (let j = 0; j < elNodes.length; j++) {
            Time_template.waitStyle(true, el)
            const obj = new Object({});
            obj.id = id
            obj.el = el
            obj.type = elNodes[j].firstChild.textContent;   // node命名为模板名称
            obj.num = elNodes.length;   // node数量为聚合数量
            obj.data = JSON.parse(elNodes[j].lastChild.textContent.replace(/`/g, ''));  // 配置数据
            Time_template.layoutDiv(obj);   // 开始进栈
        }
    }
}


const decodeCustomString = (customString) => {
    return window.decodeURIComponent(window.atob(customString))
}

/**
 * 简易的时间处理
 * @param time
 * @returns {null|Date|*}
 */
const parseTime = (time) => {
    if (!time) {
        return null;
    }

    if (/^\d+$/.test(time)) {
        // 尝试将字符串解析为毫秒级时间戳
        const millisecondsTimestamp = parseInt(time);
        if (String(millisecondsTimestamp).length === 13) {
            return new Date(millisecondsTimestamp);
        }

        // 尝试将字符串解析为秒级时间戳
        const secondsTimestamp = parseInt(time);
        if (String(secondsTimestamp).length === 10) {
            return new Date(secondsTimestamp * 1000);
        }
    }

    const parsedDate = new Date(time);
    if (!isNaN(parsedDate.getTime())) {
        // 如果能够成功解析为日期对象，则返回
        return parsedDate;
    }

    // 如果无法解析为日期对象，尝试解析英文时间
    const parsedEnglishDate = new Date(Date.parse(time));
    if (!isNaN(parsedEnglishDate.getTime())) {
        return parsedEnglishDate;
    }

    // 无法解析的情况下，返回原始值
    return time;
};

/**
 * 时间戳同谐
 * @param {string|number} timestamp
 * @returns {number}
 */
const convertToMilliseconds = (timestamp) => {
    // 定义支持的时间格式
    const formats = [
        /^\d{13}$/, // 13位时间戳
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, // ISO 8601 格式
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/ // 常规日期时间格式
    ];

    let date;

    // 如果是13位时间戳，直接返回
    if (formats[0].test(timestamp)) {
        return parseInt(timestamp);
    }

    // 如果是数字，填充到13位
    if (typeof timestamp === 'number') {
        timestamp = timestamp.toString().padEnd(13, '0');
    } else if (typeof timestamp === 'string') {
        // 尝试匹配支持的时间格式
        for (const format of formats) {
            if (format.test(timestamp)) {
                if (format === formats[1]) { // ISO 8601 格式
                    date = new Date(timestamp);
                } else if (format === formats[2]) { // 常规日期时间格式
                    date = new Date(timestamp.replace(' ', 'T') + 'Z'); // 转为ISO格式
                }
                break;
            }
        }

        // 如果未匹配到任何格式，则尝试其他解析方式
        if (!date) {
            date = new Date(timestamp);
        }
    } else {
        date = new Date(timestamp);
    }

    // 确保date是有效的
    if (!isNaN(date.getTime())) {
        timestamp = date.getTime().toString().padEnd(13, '0');
    } else {
        throw new Error('Invalid date format');
    }

    return parseInt(timestamp);
};


/**
 * 简易的时间转中文
 * @param date
 * @returns {string}
 */
const formatChineseDate = (date) => {
    if (!(date instanceof Date)) {
        return '';
    }

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}年 ${month}月 ${day}日`;
};

const UIGen = {
    genConfig: (tag = 'div') => {
        return {
            tag: tag, // 标签名
            classList: [],  // class列表
            id: '', // ID
            style: {},  // 自定义style
            content: '',    // 标签内容
            stellar: {},    // stellar可选样式
        }
    },
    genTag: (genConfig) => {
        const tag = document.createElement(genConfig.tag)
        tag.classList = genConfig.classList
        tag.setAttribute('id', genConfig.id)
        tag.innerHTML = `${genConfig.content}`
        return tag
    },
    genStellar: {
        // 折叠面板
        // stellar{ color, open:false } content{ title, body }
        folding: (genConfig) => {
            return `
                <details class="tag-plugin colorful folding" color="${genConfig.stellar.color}" ${genConfig.stellar.open ? "open" : null}>
                    <summary>
                        <span>${genConfig.content.title}</span>
                    </summary>
                    <div class="body">
                        ${genConfig.content.body}
                    </div>
                </details>`
        },
        // 瀑布流画廊
        // content[src1,src2]
        gallery: (genConfig) => {
            const getCell = (imgUrl) => {
                return `<div class="flow-cell"><img class="lazy entered loaded" src="${imgUrl}" data-src="${imgUrl}" data-ll-status="loaded"><div class="image-meta"></div></div>`
            }
            let gallery = genConfig.content.map(item => getCell(item)).join('');
            return `<div class="tag-plugin gallery fancybox flow-box" size="mix" ratio="square" style="${genConfig.content.length === 2 ? 'column-count: 2;' : ''}">${gallery}</div>`
        }
    }
}

/**
 * 控件调用器
 * @type {{getMsg: (function(*): string|*), getAuthor: (function(*): string|string), getNeteaseMusic: ((function(*): (string|string|string))|*), getAvatar: ((function(*): (string|string))|*), getTimestamp: ((function(*): (string|string))|*), getTags: ((function(*): (string|string))|*), getPics: ((function(*, *): (string|string))|*)}}
 */
const TempStyle = {
    getAuthor: (data) => Matcher.safeIsNull(data['author']) ? '' : `<span style="padding: 8px;">${data['author']}</span>`,
    getAvatar: (data) => Matcher.safeIsNull(data['avatar']) ? '' : `<img style="height: 30px;" src="${data['avatar']}" onerror="javascript:this.src='${data['avatar']}';">`,
    getTags: (data) => Matcher.safeIsNull(data['tags']) ? '' : (Array.isArray(data['tags']) ? data['tags'] : [data['tags']]).map(tag => `<a class="tag-plugin tag" style="margin: 0; font-size: small; float: right;" color="yellow" target="_blank" rel="external nofollow noopener noreferrer">#${tag}</a>`).join(' ') + '<br>',
    getMsg: (data) => Matcher.safeIsNull(data['msg']) ? '' : `<div style="padding: 8px;">${data['msg'].replace(/\n/g, '<br>')}</div>`,
    getTimestamp: (data) => {
        const timestamp = data['time'];
        if (Matcher.safeIsNull(timestamp)) return '';
        const parsedDate = parseTime(timestamp);
        if (!parsedDate) return '';
        return formatChineseDate(parsedDate);
    },
    getNeteaseMusic: (data) => {
        const mid = data['music'];
        if (Matcher.safeIsNull(mid)) return '';
        return mid === null ? '' : `<embed class="timetmpl_netease" style="height: 2.8rem;filter: saturate(0.5);width: 12rem" src="//music.163.com/outchain/player?type=2&id=${mid}&auto=0&height=32"></embed>`;
    },
    getQuote: (data) => {
        const quote = data['quote'];
        if (Matcher.safeIsNull(quote)) return '';
        else if ('extra' in quote) {
            const avatar = quote['extra']['avatar'], author = quote['extra']['author'],
                content = quote['extra']['content']
            if (Matcher.safeIsNull(content)) {
                return ''
            } else if (Matcher.safeIsNull(author)) {
                return `<blockquote style="font-size: smaller;">${content.replace(/\n/g, "<br>")}</blockquote>`
            }
            return `<blockquote style="font-size: smaller;">
                        <div class="user-info" style="display: flex; align-items: center;height: 40px;justify-content: flex-start;">
                            ${Matcher.safeIsNull(avatar) ? '' : '<div><img style="height: 30px;" src="' + avatar + '"></div>'}
                            ${Matcher.safeIsNull(author) ? '' : '<div><span style="padding: 8px;font-weight: bold"> @ ' + author + ' : </span></div>'}
                        </div>
                        ${content.replace(/\n/g, "<br>")}
                    </blockquote>`
        } else if (!('extra' in quote)) return quote === null ? '' : `<blockquote style="font-size: smaller;">${quote.replace(/\n/g, "<br>")}</blockquote>`;
        else return ''
    },
    getPics: (data) => {
        const pics = data['pics'];
        if (Matcher.safeIsNull(pics)) return '';
        return pics.length >= 2 ? UIGen.genStellar.gallery({content: pics}) : `<div class="tag-plugin image"><div class="image-bg"><img class="lazy entered loaded" style="max-height: 35vh; width: auto;" src="${pics[0].replace(/http:\/\//g, 'https://')}" data-src="${pics[0].replace(/http:\/\//g, 'https://')}" data-ll-status="loaded"></div></div>`;
    },
    getOriginLink: (data) => {
        const link = data['link'], like = data['like'], comment = data['comment'];
        const linkHtml = Matcher.safeIsNull(link) ? '' : ` <a title="跳转" class="social" href="${link}" target="_blank" rel="noopener noreferrer"><i style="line-height: 1;">🚀</i></a>`;
        const likeHtml = Matcher.safeIsNull(like) ? '' : ` <a title="有${like}位觉得很赞" class="social" href="${link}" target="_blank" rel="noopener noreferrer"><i style="line-height: 1;">❤${like}</i></a>`;
        const commentHtml = Matcher.safeIsNull(comment) ? '' : ` <a title="有${comment}条相关讨论" class="social" href="${link}" target="_blank" rel="noopener noreferrer"><i style="line-height: 1;">💬${comment}</i></a>`;
        return `<div style="filter: none;display: flex;text-align: center;font-size: smaller;grid-gap:unset" class="social-wrap">${likeHtml !== '' ? '' : linkHtml}${likeHtml}${commentHtml}</div>`
    },
    getFromAndIcon: (data) => {
        const origin = data['from'], icon = data['icon'];
        return Matcher.safeIsNull(origin) ? '' : `<div style="display: flex;align-items: center;font-style: italic;font-family: cursive;font-size: smaller;" ><div class="widget-body related-posts fs14" style="display: flex;align-items: center;color: var(--text-p1);margin:0;font-size: smaller;">--&nbsp;From&nbsp;${data['link'] ? '<a title="跳转到此动态" style="margin-top: 0;font-size: smaller;" class="item title" target="_blank" href="' + data["link"] + '"><span class="title" style="font-size: small;">' + origin + '</span></a>' : origin}&nbsp;${Matcher.safeIsNull(icon) ? '' : `  <img style="width: 1rem;margin-left: 4px;" src="${icon}" > `}</div></div>`;
    },
    getFooter: (data) => {
        let footerLeft = `<div class="flex left timetmpl_mobile">${TempStyle.getOriginLink(data)}</div>`
        let footerCenter = `<div class="flex center timetmpl_mobile"></div>`
        let footerRight = `<div class="flex right">${TempStyle.getFromAndIcon(data)}</div>`
        const footer = `<div class="footer" style="display: flex;justify-content: space-between;align-items: center;"><div>${footerLeft}</div><div>${footerCenter}</div><div>${footerRight}</div></div>`
        return footer === '<div class="footer" style="display: flex;justify-content: space-between;"></div>' ? '' : footer
    },
    getTitle: (data) => Matcher.safeIsNull(data['title']) ? '' : `<div class="tag-plugin quot"><p class="content" type="icon">${data['title']}</p></div>`,
    // TODO: 想添加可选右侧悬浮小图标
    // getFloat: (data) => {
    //     let float = '<div class="actions">\n' +
    //         '      <div class="action-button"><img height="20px" src="/access/image/logo/start.svg"><p>9999</p></div>\n' +
    //         '      <div class="action-button"><img height="20px" src="/access/image/logo/comment.svg"><p>10</p></div>\n' +
    //         '      <div class="action-button"><img height="20px" src="/access/image/logo/share.svg"><p>10</p></div>\n' +
    //         '    </div>'
    //     return float
    // },
    getFloatStyle: () => {
        return '<style>.actions{\n' +
            '  display: none;\n' +
            '}\n' +
            '\n' +
            ' div.timenode:hover > div.body > div.actions {\n' +
            '   width: 6rem;\n' +
            '   height: .001rem;\n' +
            '   position: relative;\n' +
            '   bottom: 6.3rem;\n' +
            '   right: -105%;\n' +  // TODO: 这里有bug, 按百分比距离不一样
            '   display: flex;\n' +
            '   flex-direction: column;\n' +
            '   transform: translateY(-50%);z-index: 999\n' +
            '  }\n' +
            '\n' +
            '  .action-button {\n' +
            '    width: 4rem;\n' +
            '    border-radius: 50%;\n' +
            '    margin-bottom: 2px;\n' +
            '    display: flex;\n' +
            '    justify-content: space-between;\n' +
            '    align-items: center;\n' +
            '    cursor: pointer;\n' +
            '  }\n' +
            'div.action-button > img{margin: 0 0 0 6px !important;filter: grayscale(1)}div.action-button:hover > img{filter: grayscale(0)}' +
            '\n' +
            '  .action-button:hover {\n' +
            // '    background-color: #ccc;\n' +
            '  }</style>'
    },
    getTimeNode: (configObject) => {
        const cell = document.createElement('div')
        cell.classList.add("timenode")
        cell.setAttribute("index", Date.now().toString())
        const content =
            `<div class="header">
                <div class="user-info" style="display: flex; align-items: center;height: 30px;">
                    ${TempStyle.getAvatar(configObject)}${TempStyle.getAuthor(configObject)}
                </div>
                ${TempStyle.getTimestamp(configObject)}
            </div>
            <div class="body">
                ${TempStyle.getTitle(configObject)}
                <div class="timetmpl_meta timetmpl_mobile" style="display: flex;flex-direction: row;justify-content: space-between;align-items: center;">
                    <div>${TempStyle.getNeteaseMusic(configObject)}</div><div>${TempStyle.getTags(configObject)}</div>
                </div>
                ${TempStyle.getMsg(configObject)}
                ${TempStyle.getQuote(configObject)}
                ${TempStyle.getPics(configObject)}
                ${TempStyle.getFooter(configObject)}
            </div>
            `;
        cell.innerHTML = content
        return cell;
    },
};

// 数据匹配器
const Matcher = {
    /**
     * 循环主匹配方法
     * @param origin 原数据
     * @param config 原配置
     * @returns {*[]}
     */
    forMain: function (origin, config) {
        let data = Object.assign(origin)
        data = "root" in config ? this.main(data, config.root) : data
        delete config.api;
        delete config.root;
        let configs = []
        for (let i = 0; i < data.length; i++) {
            let configItem = {}
            let exit = false
            for (let key of Object.keys(config)) {
                if ('once' in config && i > 0) {
                    configItem[key] = configs[0][key]
                    continue
                }
                const value = config[key];
                const match = this.main(data[i], value, configItem);
                if (this.commandCheck(match)) {
                    exit = true
                    break;
                }
                configItem[key] = match;
            }
            if (exit) {
                continue
            }
            configs.push(configItem)
        }
        return configs
    },
    /**
     * 主匹配方法
     * @param data {any} 原始数据
     * @param config {any} 配置文件
     * @param configItem 已解析数据
     * @returns {any} 结果数据
     */
    main: function (data, config, configItem) {
        config = typeof config === "string" ? {path: config} : config
        if ('default' in config) {
            return config.default
        }
        if ('extra' in config) {
            return this.commandExtra(data, config.extra)
        }
        if ('path' in config) {
            const paths = (typeof config === "string" ? config : config.path).split('.')
            for (let i = 0; i < paths.length; i++) {
                data = this.read(data, paths[i])
            }
        }
        if ('exclude' in config && !this.commandExclude(data, config.exclude)) {
            return {command: 'command-exclude-true'}
        }
        if ('include' in config && this.commandExclude(data, config.include)) {
            return {command: 'command-include-false'}
        }
        if ('replace' in config) {
            const isArray = Array.isArray(config.replace)
            const replace = isArray ? (config.replace.length > 1 ? config.replace[1] : '') : ''
            data = this.commandReplace(data, isArray ? config.replace[0] : config.replace, replace)
        }
        if ('prefix' in config) {
            data = this.commandFix(data, config.prefix, configItem)
        }
        if ('suffix' in config) {
            data = this.commandFix(data, config.suffix, configItem, false)
        }
        if ('markdown' in config && config.markdown === true) {
            data = this.commandMarkdown(data)
        }
        return data
    },
    /**
     * 读取子节点
     * @param data {any} 处理中数据
     * @param path {string} 字符串路径或数组选择器 e.g.( originUrl, pics[2:] )
     * @returns {*|null} 处理后数据
     */
    read: function (data, path) {
        const arrayRegex = /\[([^\]]*)]$/  // /\[([^\]]+)]$/;
        const match = path.match(arrayRegex);
        // 根据条件取数组集合
        if (match) {
            path = path.substring(0, path.search(/\[/))
            const params = match[1].split(':');
            if (params.length === 2) {
                const [start, end] = [[''].includes(params[0]) ? 0 : Number(params[0]), [''].includes(params[1]) ? -1 : Number(params[1])]
                return this.readArray(data, {data, path, start, end});
            } else if (params.length === 1) {
                if (['*', 'all', ''].includes(params[0])) {
                    return this.readArray(data, {data, path, start: '*'});
                } else {
                    return this.readArray(data, {data, path, index: Number(params[0])});
                }
            } else {
                return data
            }
        } else {
            // 集合得遍历取json集合
            if (Array.isArray(data)) {
                for (let i = 0; i < data.length; i++) {
                    data[i] = Array.isArray(data[i]) ? this.read(data[i], path) : this.readJson(data[i], path)
                }
                return data
            } else {
                return this.readJson(data, path)
            }
        }
    },
    /**
     * 读取子节点为对象
     * @param data 处理中数据
     * @param path 字符串路径或数组选择器 e.g.( originUrl, pics[2:] )
     * @returns {*|null} 处理后数据
     */
    readJson: function (data, path) {
        data = this.safeToJson(data);
        return data && data[path] !== undefined ? data[path] : null;
    },
    /**
     * 读取子节点为数列
     * @param data 处理中数据
     * @param params {{path: string, index?: number, start?: number|'*', end?: number}}
     * @returns {*|null} 处理后数据
     */
    readArray: function (data, params) {
        data = this.read(data, params.path)
        if ('start' in params) {
            return params.start === '*' ? data : this.safeSliceArray(data, params.start, params.end)
        } else {
            return this.safeSliceArray(data, params.index, params.index + 1)
        }
    },
    /**
     * 指令exclude：关键字数组是否存在于结果数据，有则排除结。
     * 反向使用为include效果
     * @param data {any} 结果数据
     * @param excludeList {Array} 关键字数组
     * @returns {boolean} 不包含为True
     */
    commandExclude: function (data, excludeList) {
        if (typeof data === 'string') {
            return excludeList.every(keyword => data.indexOf(keyword) === -1);
        } else if (Array.isArray(data)) {
            return data.every(item => this.commandExclude(item, excludeList));
        } else {
            return true;
        }
    },
    commandMarkdown: function (data) {
        let html = data;
        html = html.replace(/\*\*(.*?)\*\*|__(.*?)__/g, (_, p1, p2) => p1 ? `<strong>${p1}</strong>` : `<em>${p2}</em>`);   // Bold and Italics
        html = html.replace(/```(.*?)```|`(.*?)`/gs, (_, p1, p2) => `<code>${p1 || p2}</code>`);    // Code
        html = html.replace(/!\[(.*?)\]\((.*?)\)|\[(.*?)\]\((.*?)\)/g, (_, alt, src, linkText, href) => {   // Images and Links
            if (alt && src) return `<img class="lazy entered loaded" alt="${alt}" src="${src}" data-src="${src}" />`;
            if (linkText && href) return `<a href="${href}">${linkText}</a>`;
            return _;
        });
        html = html.replace(/- \[x\]|- \[ \]|- \[\]/g, '<input type="checkbox" $& />'); // Checkboxes
        html = html.replace(/^(\d+)\. (.*)$/gm, '<ol><li>$2</li></ol>');    // Ordered Lists
        html = html.replace(/^(> .*)$/gm, '<blockquote>$1</blockquote>');   // Blockquotes
        html = html.replace(/^-{3,}$/gm, '<hr />'); // Horizontal Lines
        html = html.replace(/\|(.+)\|/g, (_, columns) => {  // Tables
            const headers = columns.trim().split('|').map(col => `<th>${col}</th>`).join('');
            return `<table><thead><tr>${headers}</tr></thead></table>`;
        });
        html = html.replace(/^\[(.*?)\]:\s*(.*?)$/gm, '<a href="$2">$1</a>');   // Link References
        html = html.replace(/^[\*\-] (.*)$/gm, '<li>$1</li>');  // Lists and Headings
        html = html.replace(/^#{1,6} (.*)$/gm, (match, p1) => `<h${match.trim().length}>${p1}</h${match.trim().length}>`);
        html = `${html.replace(/<\/li><li>/g, '</li>\n<li>')}`;    // Wrap with <ul> for lists
        return html;
    },
    /**
     * 指令replace：正则替换字符串
     * @param data 结果数据
     * @param regex 正则表达式，报错就转 atob 加  codeURI
     * @param replace 替换内容，默认为空
     * @returns {*|string}
     */
    commandReplace: function (data, regex, replace = '') {
        const base64Regex = /^[A-Za-z0-9+/=]+$/
        regex = new RegExp(base64Regex.test(regex) ? decodeURIComponent(atob(regex)) : regex);
        if (Array.isArray(data)) {
            return data.map(item => this.commandReplace(item, regex, replace));
        } else if (typeof data === 'string') {
            return data.replace(regex, replace);
        } else {
            return data;
        }
        return data
    },
    /**
     * 指令replace：添加前后缀
     * @param data 结果数据
     * @param fix 缀
     * @param configItem 已解析数据
     * @param isPrefix {boolean} 默认前缀
     * @returns {*|string}
     */
    commandFix: function (data, fix, configItem, isPrefix = true) {
        fix = this.commandValue(fix, configItem)
        if (Array.isArray(data)) {
            return data.map(item => this.commandFix(item, fix, isPrefix));
        } else if (typeof data === 'string' || typeof data === 'number') {
            return isPrefix ? '' + fix + data : '' + data + fix;
        } else {
            return data;
        }
        return data
    },
    /**
     * 占位变量 ${xxx}
     * @param template 模板文字
     * @param config
     * @returns {*}
     */
    commandValue: function (template, config) {
        return template.replace(/\${([^}]+)}/g, (match, key) => config[key] || '');
    },
    /**
     * 额外内容
     * @param data 原数据
     * @param config 额外配置
     * @returns {{extra: *[]}}
     */
    commandExtra: function (data, config) {
        const origin = Object.assign(data)
        const isArray = Array.isArray(origin)
        const extra = this.forMain(isArray ? origin : [origin], config)
        return {"extra": isArray ? extra : extra[0]}
    },
    commandCheck: function (data) {
        const exitArray = [
            'command-exclude-true',
            'command-include-false'
        ]
        if (typeof data === 'object' && !this.safeIsNull(data) && 'command' in data) {
            return exitArray.includes(data.command)
        } else {
            return false
        }
    },
    commandSort: function (data, config, identifier={}) {
        if ((Object.keys(data[0]).includes('time') && Object.keys(config).includes('sort')) || identifier?.num > 1) {// 时间序列化
            const sort = !("sort" in config["time"] && config["time"]["sort"] === 1);
            data.sort((a, b) => {
                const timestampA = convertToMilliseconds(a['time']);
                const timestampB = convertToMilliseconds(b['time']);
                return sort ? timestampB - timestampA : timestampA - timestampB;
            });
        }
        return data
    },
    safeToJson: function (data) {
        if (Array.isArray(data) || (typeof data === "object" && data !== null)) {
            return data;
        } else if (typeof data === "string") {
            try {
                return JSON.parse(data);
            } catch (error) {
                return data;
            }
        }
        return null;
    },
    safeSliceArray: function (item, start, end) {
        if (item === null || item === [] || start >= item.length) {
            return null;
        }
        if (end >= item.length) {
            end = -1;
        }
        const slicedItem = item.slice(start, end);
        return slicedItem.length === 0 ? null : slicedItem;
    },
    safeIsNull: function (_obj) {
        const _type = Object.prototype.toString.call(_obj).slice(8, -1).toLowerCase();
        const isEmpty = () => {
            switch (_type) {
                case "array":
                case "string":
                    return !_obj.length;
                case "object":
                    return JSON.stringify(_obj) === "{}";
                case "map":
                case "set":
                    return !_obj.size;
                default:
                    return !_obj;
            }
        };
        return isEmpty();
    }
}

// 数据配置模板
const TmplConfig = {
    tmpl: ['memos', 'netease'],
    memos: {
        "root": {
            "path": "memos[*]"
        },
        "author": {
            "default": "钟意"
        },
        "avatar": {
            "default": "https://blog.thatcoder.cn/custom/img/flomo.svg"
        },
        "msg": {
            "path": "content",
            "markdown": true
        },
        "pics": "resources[*].externalLink",
        "time": {
            "path": "createTime",
            "sort": 0,
            "style": 1,
            "format": "zh"
        },
        "from": {
            "default": "Memos "
        },
        "icon": {
            "default": "https://blog.thatcoder.cn/custom/img/flomo.svg"
        }
    },
    netease: {
        "root": "events[]",
        "uid": {
            "path": "user.userId",
            "once": true
        },
        "author": {
            "path": "user.nickname",
            "once": true
        },
        "avatar": {
            "path": "user.avatarUrl",
            "once": true
        },
        "msg": "json.msg",
        "quote": {
            "extra": {
                "content": "json.resource.content",
                "avatar": "json.resource.user.avatarUrl",
                "author": "json.resource.user.nickname",
            }
        },
        "music": {
            "path": "json.song.id",
            "type": "netease"
        },
        "tags": {
            "path": "bottomActivityInfos[*].name",
            "exclude": ["黑胶"]
        },
        "pics": "pics[*].originUrl",
        "time": {
            "path": "showTime",
            "sort": 0,
            "style": 1,
            "format": "zh"
        },
        "link": {
            "path": "id",
            "prefix": "https://music.163.com/#/event?id=",
            "suffix": "&uid=${uid}"
        },
        "comment": "info.commentCount",
        "like": "info.likedCount",
        "from": {
            "default": "网易云音乐"
        },
        "icon": {
            "default": "https://blog.thatcoder.cn/custom/img/网易云音乐.svg"
        }
    },
}

timetmpl()
