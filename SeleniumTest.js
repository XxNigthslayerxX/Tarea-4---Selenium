const { Builder, By, until } = require("selenium-webdriver");
const fs = require("fs");
const path = require("path");

async function guardarCaptura(driver, nombreArchivo) {
  const rutaCarpeta = path.join(__dirname, "CaptureTest");
  if (!fs.existsSync(rutaCarpeta)) {
    fs.mkdirSync(rutaCarpeta);
  }
  const screenshot = await driver.takeScreenshot();
  const rutaCompleta = path.join(rutaCarpeta, nombreArchivo);
  fs.writeFileSync(rutaCompleta, screenshot, "base64");
  console.log(`Captura guardada: ${rutaCompleta}`);
}

(async function pruebaCompletaSauceDemo() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    // 1. LOGIN - Historia 1
    await driver.get("https://www.saucedemo.com/");
    await driver.sleep(1000);
    await driver.findElement(By.id("user-name")).sendKeys("standard_user");
    await driver.sleep(500);
    await driver.findElement(By.id("password")).sendKeys("secret_sauce");
    await driver.sleep(500);
    await driver.findElement(By.id("login-button")).click();
    await driver.wait(until.urlContains("inventory"), 5000);
    await driver.sleep(1500);
    await guardarCaptura(driver, "1_Login.png");

    // 2. AGREGAR PRODUCTOS - Historia 2
    const btnBackpack = await driver.wait(
      until.elementLocated(By.id("add-to-cart-sauce-labs-backpack")),
      5000
    );
    await driver.wait(until.elementIsVisible(btnBackpack), 2000);
    await btnBackpack.click();
    console.log("Primer producto agregado: Sauce Labs Backpack");
    await driver.sleep(3500);

    const btnBikeLight = await driver.wait(
      until.elementLocated(By.id("add-to-cart-sauce-labs-bike-light")),
      5000
    );
    await driver.wait(until.elementIsVisible(btnBikeLight), 2000);
    await btnBikeLight.click();
    console.log("Segundo producto agregado: Sauce Labs Bike Light");
    await driver.sleep(3500);

    const carritoContador = await driver.findElement(
      By.className("shopping_cart_badge")
    );
    const cantidad = await carritoContador.getText();

    if (cantidad === "2") {
      console.log("2 productos agregados al carrito correctamente.");
    } else {
      console.log(`El carrito tiene ${cantidad} productos. Se esperaban 2.`);
    }

    await driver.findElement(By.className("shopping_cart_link")).click();
    await driver.wait(until.urlContains("cart.html"), 5000);
    await driver.sleep(1500);

    const productosEnCarrito = await driver.findElements(
      By.className("inventory_item_name")
    );
    console.log("Productos en el carrito:");
    for (let producto of productosEnCarrito) {
      const nombre = await producto.getText();
      console.log("- " + nombre);
    }

    await guardarCaptura(driver, "2_AgregarProductos.png");
    await driver.sleep(1500);

    // 3. REMOVER PRODUCTO - Historia 3
    const btnRemoveBackpack = await driver.wait(
      until.elementLocated(By.id("remove-sauce-labs-backpack")),
      5000
    );
    await btnRemoveBackpack.click();
    console.log('Producto "Sauce Labs Backpack" eliminado del carrito.');
    await driver.sleep(1000);

    const productosRestantes = await driver.findElements(
      By.className("cart_item")
    );
    if (productosRestantes.length === 1) {
      console.log("Un producto permanece en el carrito después del remove.");
    } else {
      console.log(
        `Se esperaba 1 producto restante, pero hay: ${productosRestantes.length}`
      );
    }

    await guardarCaptura(driver, "3_RemoverProducto.png");

    // 4. CHECKOUT - Historia 4
    await driver.findElement(By.id("checkout")).click();
    await driver.wait(until.urlContains("checkout-step-one.html"), 5000);
    await driver.sleep(1500);

    await driver.findElement(By.id("first-name")).sendKeys("Rusbell");
    await driver.sleep(500);
    await driver.findElement(By.id("last-name")).sendKeys("Uceta");
    await driver.sleep(500);
    await driver.findElement(By.id("postal-code")).sendKeys("0234");
    await driver.sleep(500);

    await driver.findElement(By.id("continue")).click();
    await driver.wait(until.urlContains("checkout-step-two.html"), 5000);
    await driver.sleep(1500);

    console.log("Formulario de checkout completado correctamente.");
    await guardarCaptura(driver, "4_Checkout.png");

    // 5. FINALIZAR COMPRA Y LOGOUT - Historia 5
    await driver.findElement(By.id("finish")).click();
    await driver.wait(until.urlContains("checkout-complete.html"), 5000);
    await driver.sleep(1500);

    const mensajeFinal = await driver
      .findElement(By.className("complete-header"))
      .getText();
    if (mensajeFinal === "Thank you for your order!") {
      console.log("Pedido finalizado correctamente.");
    } else {
      console.log("El mensaje de confirmación no es el esperado.");
    }

    await guardarCaptura(driver, "5_Finalizado.png");

    await driver.findElement(By.id("back-to-products")).click();
    await driver.wait(until.urlContains("inventory.html"), 5000);
    await driver.sleep(1000);

    await driver.findElement(By.id("react-burger-menu-btn")).click();
    await driver.sleep(1000);
    await driver.findElement(By.id("logout_sidebar_link")).click();
    await driver.wait(until.urlContains("saucedemo.com"), 5000);
    await driver.sleep(1000);

    console.log("Sesión finalizada correctamente.");
    await guardarCaptura(driver, "6_Logout.png");

    await driver.sleep(2000); // Ver resultado final antes de cerrar
  } catch (error) {
    console.error("Error durante la prueba:", error);
  } finally {
    await driver.quit();
  }
})();
