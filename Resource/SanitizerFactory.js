import tagsInfo from "./htmlInfo.js";
export default sanitizeHTMLFactory();

function sanitizeHTMLFactory() {
  const {html, svg, tags} = tagsInfo;
  const findAttr = (store, name) => store.find(a => a === name)
  const attrRegExpStore = {
    data: /data-[\-\w.\p{L}]/ui, // data-* minimal 1 character after dash
    validURL: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    whiteSpace: /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g,
    notAllowedValues: /javascript|injected|noreferrer|alert|DataURL/gi
  };
  const isAllowed = elem => {
    const nodeName = elem?.nodeName.toLowerCase() || `none`;
    return nodeName.startsWith(`#`) || !!tags[nodeName];
  };

  return sanitize;

  function sanitize(el2Clean) {
    const elCreationInfo = {
      rawHTML: el2Clean.outerHTML,
      removed: {},
    };

    if (el2Clean instanceof HTMLElement) {
      [...el2Clean.childNodes].forEach(child => {
        if (child?.children?.length) { sanitize(child); }

        if (child?.attributes) {
          const attrStore = child instanceof SVGElement ? svg : html;

          [...child.attributes]
            .forEach(attr => {
              const [name, value] = [
                attr.name.trim().toLowerCase(),
                attr.value.trim().toLowerCase().replace(attrRegExpStore.whiteSpace, ``) ];
              const evilValue = name === "href"
                ? !attrRegExpStore.validURL.test(value)
                : attrRegExpStore.notAllowedValues.test(value);
              const evilAttrib = name.startsWith(`data`)
                ? !attrRegExpStore.data.test(name)
                : !findAttr(attrStore, name);

              if (evilValue || evilAttrib) {
                elCreationInfo.removed[`${attr.name}`] = `attribute/property(-value) not allowed, removed. Value: ${
                  attr.value || `none`}`;
                child.removeAttribute(attr.name);
              }
            });
        }

        if (!isAllowed(child)) {
          let tagValue = (child?.outerHTML || child?.textContent).trim() || `EMPTY`;
          elCreationInfo.removed[`<${child.nodeName?.toLowerCase()}>`] = `not allowed, not rendered. Value: ${
            tagValue}`;
          child.remove();
        }
      });
    }

    if (Object.keys(elCreationInfo.removed).length) {
      Object.entries(elCreationInfo.removed).forEach(([k, v]) => console.info(`✘ ${k}: ${v}`));
    }

    return el2Clean;
  }
}