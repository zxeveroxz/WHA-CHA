const puppeteer = require('puppeteer');

(async () => {
   const browser = await puppeteer.launch({headless: true});
   const page = await browser.newPage();
   await page.setViewport({ width: 1920, height: 1080 });
   await page.goto('https://www.w3schools.com/howto/howto_js_remove_property_object.asp');
   await page.screenshot({path: 'buddy-screenshot.png'});

   await browser.close();
   console.log("termino");
})();