let v1config


export const initScrollIntegration = () => {
    window.addEventListener('scroll', function () {
        const allScrollAwareComponents = []
        allScrollAwareComponents.push(...document.querySelectorAll('parallax-background')) 
        allScrollAwareComponents.push(...document.querySelectorAll('parallax-content')) 
        allScrollAwareComponents.push(document.querySelector('v1-layout').getShadowRoot().querySelector('v1-web-layout')) 
        allScrollAwareComponents.push(...document.querySelectorAll('lazy-load')) 
        allScrollAwareComponents.forEach((parallax) => parallax.setAttribute('scroll-position', window.scrollY))
    });
}

function generateCSSStyles(palette) {
    let cssStyles = '';

    for (const key in palette) {
        if (palette.hasOwnProperty(key)) {
            cssStyles += `--${key}: ${palette[key]};\n`;
        }
    }

    return cssStyles;
}

export const initV1 = async (config) => {

    document.body.innerHTML = "<v1-layout />"
    v1config = {
        currentViewType: '',
        ...config
    }
    await fetch('/api/html-list')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
            }
            return response.text(); // Cambia a response.text() para ver el contenido de la respuesta
        })
        .then(data => {
            console.log({data});
            const parsedData = JSON.parse(data);
            config.menuOptions = parsedData.htmlFiles.filter((opt) => opt !== 'index.html' && opt !== 'home.html').map((opt) => {
                const label = opt.replace('.html', '')
                const menuOption = {
                    label,
                    onClick: () => {
                        window.history.pushState({}, '', `/${label}`);
                        const eventoPopstate = new Event('popstate');
                        window.dispatchEvent(eventoPopstate);
                    },
                }
                return menuOption
            })

            config.menuOptions.unshift({
                label: "HOME",
                onClick: () => {
                    window.history.pushState({}, '', `/`);
                    const eventoPopstate = new Event('popstate');
                    window.dispatchEvent(eventoPopstate);
                }
            })
               
             
        })
        .catch(error => {
            console.error('Error:', error);
        });
    v1config = {
        currentViewType: '',
        ...config
    }
    document.querySelector('v1-layout').setAttribute('loaded', true)
    const cssPalette = generateCSSStyles(config.palette);
    const cssSizes = generateCSSStyles({
        "max-width": config.maxWidth,
        "breakpoint-mobile": config.breakpoint
    });
    const themeStyles = document.querySelector('#v1-styles') || document.createElement('style');
    themeStyles.id = "v1-styles"
    themeStyles.innerText = `
        :root {
            ${cssPalette}
            ${cssSizes}
        }
        html {
            background: var(--backgroundColor);
        }
    `
    themeStyles.innerText = themeStyles.innerText.replace('<br>', '')
    document.body.prepend(themeStyles);
}

const fetchContent = async () => {
    const pathname = window.location.pathname
    const route = `${pathname.replace('/', '') || 'home'}.html`
    fetch(route)
        .then(response => {
            return response.text()
        })
        .then(html => {
            if (html.includes('<!DOCTYPE html>')) {
                document.querySelector('v1-layout').innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="300" height="200">
                    <rect width="100%" height="100%" fill="none"/>
                    <circle cx="150" cy="80" r="40" fill="#ff6347"/>
                    <text x="150" y="90" font-size="40" fill="#ffffff" text-anchor="middle" alignment-baseline="middle">!</text>
                    <text x="150" y="150" font-size="18" fill="#333333" text-anchor="middle" alignment-baseline="middle">Página no encontrada</text>
                    </svg>
                `
            } else {
                const pageScript = document.createElement('script')

                var range = document.createRange();
                var fragment = range.createContextualFragment(html);
                const v1Layout = document.querySelector('v1-layout')
                console.log(v1Layout.getShadowRoot().querySelector('v1-web-layout'));
                    
                setTimeout(() => {
                    window.scrollTo({
                        top: 1,
                    })
                    v1Layout.innerHTML = '';
                }, 0);
                setTimeout(() => {
                    v1Layout.append(fragment);
                    window.scrollTo({
                        top: 0,
                    })
                }, 0);
            }
        })
        ;
}

window.addEventListener('popstate', async function (event) {
    await fetchContent()
});

fetchContent()

function getWidthOnResize(node, callback) {
    const observer = new ResizeObserver(entries => {
        const newWidth = entries[0].contentRect.width;
        callback(newWidth);
    });
    observer.observe(node);
    return observer;
}

class V1Layout extends HTMLElement {
    static observedAttributes = ["loaded"];
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
    }
    attributeChangedCallback(ect) {
        this.render();
    }
    getShadowRoot() {
        return this.shadowRoot;
    }
    render() {
        this.shadow.innerHTML = `
            <style>
                :host {
                    height: 100%;
                }
            </style>
            <v1-web-layout>
                <slot
                    style="
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100%;
                    "
                >
                </slot>
            </v1-web-layout>
        `
    }

}

customElements.define('v1-layout', V1Layout);

class V1WebLayout extends HTMLElement {
    static observedAttributes = ["scroll-position"];
    
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.render()
    }

    attributeChangedCallback(name, oldValue, newValue) {
        const headerContainer = this.shadowRoot.querySelector('.header-container')
        const isMaximized = headerContainer.classList.contains('maximized')
        const isHome = window.location.pathname === "/"
        if (!isHome) {
            headerContainer.classList.remove('maximized')
            return
        } 
        if (Number(newValue)) {
            if(isMaximized) {
                headerContainer.classList.remove('maximized')
            }
        } else {
            if(!isMaximized) {
                headerContainer.classList.add('maximized')
            }
        }
        

    }

    render() {
        const template = document.createElement('template')
        template.id = "host"
        const styles = document.createElement('style')
        styles.innerText = `
            * {
                box-sizing: border-box;
            }
            :host {
                flex: 1;
                display: flex;
                height: 100%;
                flex-direction: column;
            }
            .header-container {
                position: fixed;
                width:100%;
                top: 0;
                z-index: 5;
                display: flex;
                justify-content: center;
                height: 45px;
                background: var(--primaryColor);
                transition: ease-in-out .3s all;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }

            .header-container .logo {
                object-fit: contain;
                margin: 0 4px;
                margin-left: 16px;
                margin-bottom: -50px;
                transition: ease-in-out all .3s;
                width: unset;
            }

            
            @media screen and (min-width: ${v1config.breakpoint}px) {
                .header-container.maximized {
                    height: 100px;
                    background: transparent;
                    box-shadow: none;
                }
                .header-container.maximized .logo {
                    padding-top: 32px;
                }
            }

            @media screen and (max-width: ${v1config.breakpoint}px) {
                
                .header-container .logo {
                    margin-bottom: 0;
                }
                
            }
           
            .header-delimiter {
                width: 100%;
                display: flex;
                justify-content: space-between;
                max-width: ${v1config.maxWidth}px;
            }
            #menu-button, #menu-trigger {
                display: none;
            }

            img {
                width: 100%;
                max-width: var(--breakpoint-mobile)px ;
            }

            #resizer {
                height: 100%;
                display: flex;
                flex-direction: column;
            }
            .content-container {
                flex: 1;
            }

            .footer-container {
                background: var(--backgroundSecondaryColor);
            }

            .menu-container {
                opacity: 0;
                visibility: hidden;
                align-items: stretch;
                display: flex;

            }
            .menu-overlay {
                opacity: 0;
                visibility: hidden;

            }
            .desktop {
                .menu-container {
                    opacity: 1;
                    visibility: visible;
                }
            }

            footer {
                color: var(--textSecondaryColor);
                padding: 32px;
                display: flex;
                justify-content: space-between;
                flex-direction: column;
                align-items: center;
            }

            footer a {
                color: var(--accentSecondaryColor);
            }
            .contact-info {
                gap: 8px;
                display: flex;
                flex-wrap: wrap;
            }
            .contact-info p {
                margin: 0;
            }
            
            .social-links a {
                color: white;
                margin-right: 10px;
            }


            .mobile {

                .title-bar-container {
                    display: flex;
                    align-items: stretch;
                    justify-content: space-between;
                    position: sticky;
                    top: 0;
                }
                #menu-button {
                    padding: 8px;
                    cursor: pointer;
                    display: flex;
                }
                #menu-button {
                    z-index: 1;
                }
            
                
                #menu-trigger:checked ~ .menu-container {
                    opacity: 1;
                    transform: translateX(0);
                    visibility: visible;
    
                }
                #menu-trigger:checked ~ .menu-overlay {
                    opacity: 1;
                    visibility: visible;
    
                }
                .menu-overlay {
                    visibility: hidden;
                    position: fixed;
                    background: rgba(0,0,0,0.05);
                    width: 100%;
                    top: 0;
                    left: 0;
                    transition: ease-in-out .3s all;
                    height: 100%;
                    backdrop-filter: blur(10px); /* Desenfoque usando backdrop-filter */
                    opacity: 0.2;
                }
    
                .content-container {
                    flex: 1;
                }
                .menu-container {
                    padding: 32px;
                    padding-top: 40px;
                    visibility: hidden;
                    position: fixed;
                    background: var(--backgroundSecondaryColor);
                    height: 100%;
                    width: 100%;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    max-width: 350px;
                    top: 0;
                    right: 0;
                    transform: translateX(50%);
                    display: flex;
                    flex-direction: column;
                    transition: ease-in-out .3s all;
                }
                .footer-container {
    
                }


                #menu-button {
                    width: 40px;
                    height: 40px;
                    position: relative;
                    cursor: pointer;
                    display:flex;
                    flex-direction: column;
                    justify-content: space-evenly;
                }
                
                .bar {
                    width: 100%;
                    border-top: 2px solid var(--accentColor);
                    border-bottom: 2px solid var(--accentColor);
                    transition: all 0.3s ease-in-out;
                    border-radius: 10px;

                }
                
                #menu-button #bar1 {
                    transform-origin: left;
                }

                #menu-trigger:checked ~ #menu-button #bar1 {
                    transform: rotate(45deg) translateX(-2px);
                }
                
                #menu-trigger:checked ~ #menu-button #bar2 {
                    transform: translateX(-24px) scaleX(0);
                    opacity: 0;
                }

                #menu-button #bar3 {
                    transform-origin: left;
                }
                
                #menu-trigger:checked ~ #menu-button #bar3 {
                    transform: rotate(-45deg) translateX(-2px);
                    transform-origin: left;
                }
                
            }
        `
        styles.innerText = styles.innerText.replace('<br>', '')
        template.innerHTML = `
            <div id="resizer">
                <div class="header-container ${window.location.pathname !== "/" ? '' :"maximized"}">
                    <div class="header-delimiter">
                        <img class="logo" src="${v1config.contactInfo.logo}" >
                        <div class="title-bar-container"></div>
                        <input id="menu-trigger" type="checkbox">
                        <div id="menu-overlay" class="menu-overlay"></div>
                        <div class="menu-container"><v1-simple-menu /></div>
                        <div id="menu-button">
                            <div class="bar" id="bar1"></div>
                            <div class="bar" id="bar2"></div>
                            <div class="bar" id="bar3"></div>
                        </div>
                    </div>
                </div>
                <div class="content-container"><slot></slot></div>
                <div class="footer-container"></div>
            </div>
        `
        const contentNode = template.content.cloneNode(true);
        const headerContent = `
            <div></div>
        `

        contentNode.querySelector('.title-bar-container').innerHTML = `${headerContent}${contentNode.querySelector('.title-bar-container').innerHTML}`
        contentNode.querySelector('.footer-container').innerHTML = `
            <footer>
                <p>&copy; 2024 ${v1config?.contactInfo?.companyName} | <a href="${v1config?.contactInfo?.email}">${v1config?.contactInfo?.email}</a> | ${v1config?.contactInfo?.phone}</p>
                <div class="social-links">
                    <!-- Agrega aquí enlaces a tus redes sociales -->
                </div>
            </footer>
        `
        const menu = contentNode.querySelector('v1-simple-menu')
        const menuButton = contentNode.querySelector('#menu-button')
        const menuOverlay = contentNode.querySelector('#menu-overlay')
        const inputTrigger = contentNode.querySelector('#menu-trigger')
        const resizer = contentNode.querySelector('#resizer')

        v1config.menuOptions.forEach(opt => {
            const button = document.createElement('v1-simple-menu-button')
            button.innerText = `${opt.label}`.toUpperCase()
            button.onclick = () => {
                opt.onClick()
                inputTrigger.checked = !inputTrigger.checked
            }
            menu.append(button)
        });

        menuOverlay.onclick = () => {
            inputTrigger.checked = !inputTrigger.checked
        }
        menuButton.onclick = () => {
            inputTrigger.checked = !inputTrigger.checked
        }

        getWidthOnResize(document.body, (width) => {
            const resizeViewType = width < v1config.breakpoint
                ? "mobile"
                : "desktop"
            if (v1config.currentViewType !== resizeViewType) {
                v1config.currentViewType = resizeViewType
                if (resizer) {
                    return resizer.className = resizeViewType
                }
            }
        })

        this.shadow.append(styles, contentNode);
    }

}

customElements.define('v1-web-layout', V1WebLayout);

class V1SimpleMenu extends HTMLElement {
    static observedAttributes = ["direction"];


    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
        this.styles = document.createElement('style')
        this.direction = this.getAttribute('direction');
        this.styles.innerText = `
            :host {
                width: 100%;
            }
            ul {
                list-style: none;
                padding: 0;
                margin: 0;
                display: flex;
                flex-direction: ${this.direction || 'row'}; 
            }
        `
        this.shadow.innerHTML = `
            <ul></ul>
        `;
        this.shadow.prepend(this.styles)
    }

    connectedCallback() {
        let currentViewType = v1config.currentViewType
        getWidthOnResize(document.body, (width) => {
            const resizeViewType = width < v1config.breakpoint ? "mobile" : "desktop"
            if (currentViewType !== resizeViewType) {
                currentViewType = resizeViewType
                if (width < v1config.breakpoint) {
                    this.setAttribute('direction', 'column')
                } else {
                    this.setAttribute('direction', 'row')
                }
            }
        })
        const buttons = this.querySelectorAll('v1-simple-menu-button');
        const ul = this.shadow.querySelector('ul')
        buttons.forEach(button => {
            const li = document.createElement('li')
            if (window.location.pathname.replace('/', '').toUpperCase() === button.innerText.replace('HOME', '').toUpperCase()) {
                li.classList.add('active')
            }
            li.append(button)
            ul.append(li)
        });


        window.addEventListener('popstate', function (event) {
            buttons.forEach(button => {
                if (window.location.pathname.replace('/', '').toUpperCase() === button.innerText.replace('HOME', '').toUpperCase()) {
                    button.parentElement.classList.add('active')
                } else {
                    button.parentElement.classList.remove('active')
                }
            });
        });

    }

    attributeChangedCallback(e) {
        this.updateComponent(e)
    }

    updateComponent() {
        this.styles.innerText = `
            ul {
                padding: 0;
                list-style: none;
                margin: 0;
                display: flex;
                flex-direction: ${this.getAttribute('direction') || 'row'}; 
            }
           
            
            ${this.getAttribute('direction') !== 'row'
                ? `
                    li {
                    }
                    li.active {
                        background: rgba(0,0,0,.05);
                    }
                `
                : `
                    li.active {
                        border-bottom: 3px solid var(--accentColor);
                    }
                `};
            
        `
    }

    renderComponent() {


    }




}

customElements.define('v1-simple-menu', V1SimpleMenu);

class V1SimpleMenuButton extends HTMLElement {
    static observedAttributes = ["direction"];


    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.innerHTML = `
            <style>
                button {
                    background: none;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 40px;
                    border: none;
                    padding: 8px;
                    color: var(--textColor);
                }
                @media screen and (max-width: ${v1config.breakpoint}px) {
                    button {
                        color: var(--menuButtonText);
                    }
                    
                }
            </style>
            <button>
                <slot></slot>
            </button>
        `;
    }
}
customElements.define('v1-simple-menu-button', V1SimpleMenuButton);


class HeadingText extends HTMLElement {
    constructor() {
      super();

      // Create a shadow root
      this.attachShadow({ mode: 'open' });

      const headingSize = this.getAttribute('heading-size');
      const position = this.getAttribute('position');
      const color = this.getAttribute('color');

      // Define the HTML content and styles
      this.shadowRoot.innerHTML = `
        <style>
            h1,h2,h3,h4,h5 {
                margin: 0;
                padding: 0;
            }
            ${headingSize} {
                display: flex;
                text-align: ${position === "flex-end" ? 'right' : position === 'center' ? 'center' : 'left' };
                align-items: center;
                justify-content: ${position || 'flex-start'};
                color: ${color || 'var(--titleTextColor)'};
                text-shadow: var(--primaryColor) 1px 1px 0;
                gap: 8px;
            }
        </style>
        <${headingSize}>
          <slot></slot>
        </${headingSize}>
      `;
    }

   
}
customElements.define('heading-text', HeadingText);


class ParragraphText extends HTMLElement {
    constructor() {
      super();

      // Create a shadow root
      this.attachShadow({ mode: 'open' });

      const headingSize = this.getAttribute('heading-size');
      const position = this.getAttribute('position');
      const color = this.getAttribute('color');

      // Define the HTML content and styles
      this.shadowRoot.innerHTML = `
        <style>
            p {
                margin: 0;
                padding: 0;
                display: flex;
                text-align: ${position === "flex-end" ? 'right' : position === 'center' ? 'center' : 'left' };
                align-items: center;
                justify-content: ${position || 'flex-start'};
                color: ${color || 'var(--textColor)'};
            }
        </style>
        <p>
          <slot></slot>
        </p>
      `;
    }

   
}
customElements.define('parragraph-text', ParragraphText);

class StaticGallery extends HTMLElement {
    constructor() {
        super();

        // Crear un shadow DOM
        this.attachShadow({mode: 'open'});

        // Obtener los atributos del elemento
        const imageUrls = this.getAttribute('image-urls');

        // Convertir la cadena JSON de los atributos en un array
        this.imageUrlsArray = JSON.parse(imageUrls);

        this.title = this.getAttribute('title')
        // Renderizar la lista de imágenes
        this.render();
    }

    connectedCallback() {
        // Agregar evento de clic a cada imagen
        this.shadowRoot.querySelectorAll('img').forEach((img, index) => {
            img.addEventListener('click', () => this.showImageInModal(index));
        });
    }

    // Método para renderizar la lista de imágenes
    render() {
        const style = document.createElement('style');
        const ul = document.createElement('ul');

        style.innerText = `
            * {
                margin: 0;
                padding: 0;
            }
            :host {
                max-width: 1200px;
                align-self: center;
                padding: 24px;
                display: flex;
                flex-direction: column;
                gap: 24px;
            }
            ul {
                display: flex;
                flex-wrap: wrap;
                list-style: none;
                gap: 24px;
                align-content: center;
            }
            li {
                cursor: pointer;
                border: 8px solid var(--secondaryColor);
                border-radius: 4px;
                flex: 1;
                min-width: 350px;
                width: calc((100% / 3) - 32px);
                max-height: 350px;
                justify-content: center;
                align-items: center;
                overflow: hidden;
                display: flex;
                background: var(--accentColor1);
            }
            li img {
                height: 100%;
                width: 100%;
                object-fit: cover;
                transition: ease-in-out .3s all;
            }

            li:hover img {
                transform: scale(1.1);
                opacity: 0.5;

            }
          

            li:hover::before {
                content: "Click para ampliar";
                position: absolute;
            }
            heading-text {
                font-size: 32px;
                padding-top: 24px;
                align-self: center;
            }
        `;

        this.shadowRoot.innerHTML = `
            <heading-text heading-size="h2">Galerìa</heading-text>
        `

        this.imageUrlsArray.forEach(url => {
            const li = document.createElement('li');
            const img = document.createElement('img');
            img.src = url;
            li.appendChild(img);
            ul.appendChild(li);
        });

        const title = document.createElement('heading-text');


        // Adjuntar la lista al shadow DOM
        this.shadowRoot.append(style, title, ul);
    }

    // Método para mostrar la imagen en pantalla completa
    showImageInModal(index) {
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '1000';

        const img = document.createElement('img');
        img.src = this.imageUrlsArray[index];
        img.style.maxWidth = '90%';
        img.style.maxHeight = '90%';
        img.style.objectFit = 'contain';

        // Cerrar modal al hacer clic fuera de la imagen
        modal.addEventListener('click', () => modal.remove());

        modal.appendChild(img);
        document.body.appendChild(modal);
    }
}
customElements.define('static-gallery', StaticGallery);

class LazyLoad extends HTMLElement {
    static get observedAttributes() {
        return ['scroll-position'];
    }

    constructor() {
      super();
      this.attachShadow({mode: 'open'});
      this.isVisible = false;
      this.hasLoaded = false;
      this.delay = this.getAttribute('delay') || 500
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (this.hasLoaded) return
        if (name === 'scroll-position') {
            const scrollPosition = Number(newValue)
            const viewPortHeight = document.body.offsetHeight
            const position = this.offsetTop
            const lazyComponentHeight =  Number(this.offsetHeight)
            const isVisible = 
                (( viewPortHeight - lazyComponentHeight + scrollPosition ) > position)
                    && (( viewPortHeight + lazyComponentHeight + scrollPosition ) < (position + viewPortHeight))
            if ( isVisible) {
                this.hasLoaded = true;
                console.table({isVisible});
                this.render();
            }
            
        }
    }

    render() {
      this.shadowRoot.innerHTML = `
        <style>
            @keyframes slideIn {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            :host {
                animation: slideIn 0.5s ${this.delay/1000}s ease-in-out forwards;
                opacity: 0;
                color: white;
            }
            
        </style>

        <slot />
      `;
      
    }
}
customElements.define('lazy-load', LazyLoad);