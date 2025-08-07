const { Builder, By, until } = require("selenium-webdriver");
const fs = require("fs");
const path = require("path");

const resultados = [];
const PAUSA_MS = 2000;

function registrarPaso(titulo, estado, mensaje, captura = "") {
  resultados.push({ titulo, estado, mensaje, captura });
}

async function guardarCaptura(driver, nombreArchivo) {
  const rutaCarpeta = path.join(__dirname, "CaptureTest");
  if (!fs.existsSync(rutaCarpeta)) {
    fs.mkdirSync(rutaCarpeta);
  }
  const screenshot = await driver.takeScreenshot();
  const rutaCompleta = path.join(rutaCarpeta, nombreArchivo);
  fs.writeFileSync(rutaCompleta, screenshot, "base64");
  console.log(`📸 Captura guardada: ${rutaCompleta}`);
}

function generarReporteHTML() {
  const ruta = path.join(__dirname, "ReportesTest");
  if (!fs.existsSync(ruta)) fs.mkdirSync(ruta);

  const html = `
    <html>
      <head>
        <title>Reporte de Prueba SauceDemo</title>
        <style>
          body { font-family: Arial; background: #f4f4f4; padding: 20px; }
          table { border-collapse: collapse; width: 100%; background: white; }
          th, td { padding: 12px; border: 1px solid #ccc; text-align: left; }
          th { background-color: #333; color: white; }
          .ok { color: green; font-weight: bold; }
          .fail { color: red; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Reporte de Prueba Automatizada - SauceDemo</h1>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Historia</th>
              <th>Estado</th>
              <th>Mensaje</th>
              <th>Captura</th>
            </tr>
          </thead>
          <tbody>
            ${resultados
              .map(
                (r) => `
              <tr>
                <td>${r.titulo}</td>
                <td class="${r.estado === "Éxito" ? "ok" : "fail"}">${
                  r.estado
                }</td>
                <td>${r.mensaje}</td>
                <td>${
                  r.captura
                    ? `<a href="../CaptureTest/${r.captura}" target="_blank">Ver</a>`
                    : "—"
                }</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>`;

  fs.writeFileSync(path.join(ruta, "reporte.html"), html, "utf-8");
  console.log("✅ Reporte generado en ReportesTest/reporte.html");
}

async function pausa(driver, ms = PAUSA_MS) {
  await driver.sleep(ms);
}

// === HISTORIAS DE USUARIO CON PAUSAS ===

async function historiaLogin(driver) {
  try {
    await driver.get("https://www.saucedemo.com/");
    await pausa(driver);
    await driver.findElement(By.id("user-name")).sendKeys("standard_user");
    await driver.findElement(By.id("password")).sendKeys("secret_sauce");
    await pausa(driver);
    await driver.findElement(By.id("login-button")).click();
    await driver.wait(until.urlContains("inventory"), 9000);
    await pausa(driver);
    await guardarCaptura(driver, "1_Login.png");
    registrarPaso("Login", "Éxito", "Inicio de sesión exitoso.", "1_Login.png");
  } catch (err) {
    registrarPaso("Login", "Fallo", err.message);
  }
}

async function historiaAgregarProductos(driver) {
  try {
    await pausa(driver);
    await driver.findElement(By.id("add-to-cart-sauce-labs-backpack")).click();
    await pausa(driver);
    await driver
      .findElement(By.id("add-to-cart-sauce-labs-bike-light"))
      .click();
    await pausa(driver);
    const carrito = await driver.findElement(
      By.className("shopping_cart_badge")
    );
    const cantidad = await carrito.getText();
    await pausa(driver);

    await driver.findElement(By.className("shopping_cart_link")).click();
    await driver.wait(until.urlContains("cart.html"), 9000);
    await pausa(driver);

    await guardarCaptura(driver, "2_AgregarProductos.png");

    if (cantidad === "2") {
      registrarPaso(
        "Agregar productos",
        "Éxito",
        "Se agregaron 2 productos correctamente.",
        "2_AgregarProductos.png"
      );
    } else {
      registrarPaso(
        "Agregar productos",
        "Fallo",
        `Cantidad incorrecta: ${cantidad}`,
        "2_AgregarProductos.png"
      );
    }
  } catch (err) {
    registrarPaso("Agregar productos", "Fallo", err.message);
  }
}

async function historiaRemoverProducto(driver) {
  try {
    await pausa(driver);
    await driver.findElement(By.id("remove-sauce-labs-backpack")).click();
    await pausa(driver);
    const productos = await driver.findElements(By.className("cart_item"));
    await pausa(driver);
    await guardarCaptura(driver, "3_RemoverProducto.png");

    if (productos.length === 1) {
      registrarPaso(
        "Remover producto",
        "Éxito",
        "Producto removido correctamente.",
        "3_RemoverProducto.png"
      );
    } else {
      registrarPaso(
        "Remover producto",
        "Fallo",
        `Productos restantes: ${productos.length}`,
        "3_RemoverProducto.png"
      );
    }
  } catch (err) {
    registrarPaso("Remover producto", "Fallo", err.message);
  }
}

async function historiaCheckout(driver) {
  try {
    await pausa(driver);
    await driver.findElement(By.id("checkout")).click();
    await pausa(driver);
    await driver.findElement(By.id("first-name")).sendKeys("Rusbell");
    await driver.findElement(By.id("last-name")).sendKeys("Uceta");
    await driver.findElement(By.id("postal-code")).sendKeys("0234");
    await pausa(driver);
    await driver.findElement(By.id("continue")).click();
    await pausa(driver);
    await guardarCaptura(driver, "4_Checkout.png");

    registrarPaso(
      "Checkout",
      "Éxito",
      "Formulario completado y continuado.",
      "4_Checkout.png"
    );
  } catch (err) {
    registrarPaso("Checkout", "Fallo", err.message);
  }
}

async function historiaFinalizar(driver) {
  try {
    await pausa(driver);
    await driver.findElement(By.id("finish")).click();
    await pausa(driver);
    const mensaje = await driver
      .findElement(By.className("complete-header"))
      .getText();
    await pausa(driver);
    await guardarCaptura(driver, "5_Finalizado.png");

    if (mensaje === "Thank you for your order!") {
      registrarPaso(
        "Finalizar compra",
        "Éxito",
        "Mensaje final correcto.",
        "5_Finalizado.png"
      );
    } else {
      registrarPaso(
        "Finalizar compra",
        "Fallo",
        `Mensaje inesperado: ${mensaje}`,
        "5_Finalizado.png"
      );
    }
  } catch (err) {
    registrarPaso("Finalizar compra", "Fallo", err.message);
  }
}

async function historiaLogout(driver) {
  try {
    await pausa(driver);
    await driver.findElement(By.id("back-to-products")).click();
    await pausa(driver);
    await driver.findElement(By.id("react-burger-menu-btn")).click();
    await pausa(driver);
    await driver.findElement(By.id("logout_sidebar_link")).click();
    await pausa(driver);
    await guardarCaptura(driver, "6_Logout.png");
    registrarPaso(
      "Logout",
      "Éxito",
      "Sesión cerrada correctamente.",
      "6_Logout.png"
    );
  } catch (err) {
    registrarPaso("Logout", "Fallo", err.message);
  }
}

(async function ejecutarPruebas() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    await historiaLogin(driver);
    await historiaAgregarProductos(driver);
    await historiaRemoverProducto(driver);
    await historiaCheckout(driver);
    await historiaFinalizar(driver);
    await historiaLogout(driver);
  } catch (error) {
    console.error("❌ Error inesperado:", error.message);
    registrarPaso("Error general", "Fallo", error.message);
  } finally {
    await driver.quit();
    generarReporteHTML();
  }
})();
