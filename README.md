# MRKL

Description: an intelligent agent that integrates a calculator within an LLM

## Componentes

1. Enrutador: saber cuando utilizar la calculadora.
2. Extractor: extraer la información necesaria para realizar la operación.
3. Modulo de cálculo: realizar la operación. Soportar suma, resta, multiplicacion y division.
4. Modulo de evaluacion: reportar resultados.

## Pruebas
- Una simple operacion como 2+2.
- Una operacion con letras en lugar de números (dos más dos).
- Una operacion dentro de un problema matematico: si tengo 2 pizzas una tiene 3 rebanadas y otra 2 rebanadas, cuantas rebanadas tengo en total.

### Pruebas avanzadas
- Mas numeros, y operaciones compuestas.


## Arquitectura

Por ahora, el enrutador y extractor va a utilizar un modelo de lenguaje. Y el modulo de evaluacion, va recibir los argumentos y aplicar la operacion.

Si las instrucciones del usuario no contienen una operacion se entrega un mensaje de error. Se utiliza JSON para la comunicación entre los modulos.

### Seguridad

No vamos a utilizar el metodo `eval` de JS para evitar inyecciones de código.

### Interfaz de usuario

Muy sencilla, simplemente, vamos a exportar las funciones y las vamos a evaluar tanto en pruebas (poca data) como en reporte de resultados (datos completos).

### Diagrama de flujo

1. Se define el texto que contiene la operacion matematica, en una funcion `main`.

2. Se genera el prompt del enrutador. Se recibe la respuesta en JSON. Se valida y se envia al extractor, o se envia el mensaje de error. La respuesta es de tipo binaria (true or falsa)

3. Se pasa la operacion o mensaje de usuario al modulo de extractor. Se genera el prompt. Se obtiene la operacion matematica y los valores de la operacion. Despues se implementan los casos avanzados.

4. Se ejectua la operacion utilizado un condicional. Se envia la respuesta al usuario o al modulo de evaluacion.

### Estructura

* `main.js`: contiene el flujo de datos.
* `prompts.js`: contiene los prompts de los modulos.
* evaluacion.js: contiene la funcion de evaluacion y pruebas.
