# Nomenclátor

**Nomenclátor** es una red neuronal LSTM que genera nombres de localidades españolas y corre en el navegador sin necesidad de instalar ningún tipo de software ni GPU. En este documento cuento casi paso a paso como duplicar el proceso de descarga de datos, entrenamiento y uso, aunque se puede saltar directamente al tercer paso.

# TL;DR

Si queréis probar el generador sin instalar nada, ni ver el código ni saber cómo está hecho, id directamente a  [https://neuronasmuertas.com/nomenclator/](https://neuronasmuertas.com/nomenclator/).

# Datos

El primer paso es encontrar un conjunto de datos lo suficientemente amplio para que la red "entienda" la estructura de los nombres de las poblaciones. Afortunadamente, he localizado una tabla de la Agencia Tributaria con todas las poblaciones de España a septiembre de 2019, en otro caso tocaba scrapear datos de diferentes páginas.

[Tabla de poblaciones y localidades](https://www.agenciatributaria.es/AEAT.internet/Inicio/Ayuda/Tablas_auxiliares_de_domicilios__provincias__municipios____/Tabla_de_Poblaciones_y_Localidades/Tabla_de_Poblaciones_y_Localidades.shtml)

Es un fichero de texto plano (`poblaciones_original_2019.txt`) de unas 60.000 entradas con este formato

![Tabla de poblaciones](https://user-images.githubusercontent.com/1846199/89101878-63f24180-d404-11ea-866e-4c1b11c6fe7d.png)

así que hay que limpiarlo un poco: dejar únicamente el nombre de las poblaciones (columnas 16 a 66), quitar los espacios, eliminar duplicados y desordenar el fichero. El script `limpia_poblaciones.sh` hace esas cuatro operaciones exactamente en ese orden...

```bash
#!/bin/bash

LC_CTYPE=C && LANG=C && cut -c16-66 ./poblaciones_original_2019.txt | \
sed -e 's/[[:space:]]*$//' | \
sort -u | \
sort -R > ./poblaciones.txt
```

... y genera un fichero nuevo (`poblaciones.txt`) con unas 40.000 localidades (¡Hay casi 20.000 poblaciones con el nombre repetido!)

Este número de entradas es más que suficiente para entrenar la red. A partir de 10.000 ejemplos ya se obtienen resultados dignos para este tipo de generación. Si en vez de nombres quisiéramos generar frases o textos medio coherentes, necesitaríamos muuuuchos más datos.

👉🏼 El fichero original, el fichero limpio y el script para limpiar el fichero se encuentra en la carpeta `datos`.

# Entrenamiento

Si queréis usar la red sin entrenarla, podéis saltar directamente a la sección "**Generación**".

👉🏼 Todos los ficheros de esta sección se encuentran en la carpeta `entrenamiento`.

Para entrenar la red neuronal uso el script de Python [training-charRNN](https://github.com/ml5js/training-charRNN). Necesita Python y TensorFlow 1.15. Lamentablemente, instalé TensorFlow hace casi un año y no me acuerdo exactamente de cómo lo hice, salvo que fue creando un entorno con anaconda. 

Si usáis la versión de `train.py` que he incluido en el repositorio, no hay que tocar nada. Si usáis la original, hay que modificar la línea 98 para especificar la codificación del fichero de las poblaciones (latin-1), o se atascará con las tildes.

```python
data_loader = TextLoader(args.data_path, args.batch_size, args.seq_length, encoding='latin-1')
```

El entrenamiento empieza al ejecutar el script `run.sh`. 

```bash
#!/bin/bash

python train.py --data_path=../datos/poblaciones.txt \
--rnn_size 256 \
--num_layers 2 \
--seq_length 64 \
--batch_size 32 \
--num_epochs 20 \
--output_keep_prob 0.75 \
--model lstm \
--save_checkpoints ./checkpoints \
--save_model ./models \
--print_every 10

#--model: rnn, gru, lstm, nas

rm -r ../generacion/models/poblaciones
cp -r ./models/poblaciones ../generacion/models/poblaciones
```

Es casi igual al script original, pero he afinado un poco los hiperparámetros (básicamente, 256 neuronas, memorización de secuencias de 64 caracteres, un batch más pequeño y menos epochs). Cuando lo arranquéis dará un montón de errores, es normal. Al cabo de un rato empezará el entrenamiento propiamente dicho y veréis algo parecido a esto:

![El festival del error.](https://user-images.githubusercontent.com/1846199/89101859-3f966500-d404-11ea-9422-fe10733b67c1.png)



Una vez que termina de ejecutarse (una hora, más o menos, en mi ordenador sin GPU), el script copiará los resultados en la carpeta `generacion/models`.

# Generación

👉🏼 Todos los ficheros de esta sección se encuentran en la carpeta `generacion`.

La chicha de la generación está en el fichero `sketch.js`.  Básicamente, carga los ficheros que hay en la carpeta `generacion/models` y llama a la red neuronal cada vez que se pulsa el botón. Además del botón, hay un slider para ajustar la temperatura de los resultados, es decir, lo conservadores u osados que van a ser. Si se selecciona un valor pequeño, la red neuronal se embucla y saca siempre los mismos resultados. Si se selecciona un valor cercano a 1, los resultados son más variados, pero a veces obtiene combinaciones de letras no válidas, no cierra los paréntesis, etc.

🌡Temperatura de 0.15

```
CASTRO DE LA CABALLERA
CASTRO DE MONTE (O)
CASTRO DE ABAIXO
CASTRO DE ARRIBA
CASTRO DE ABAIXO
CASTRO DE ARRIBA
CASTRO DE ABAIXO
CASTRO DE ARRIBA
PALACIOS DE LA SIERRA
CASTRO DE ARRIBA
CASTRO DE ARRIBA
VILAR DE CASTRO
CASTRO DE CASTRO
```

🌡Temperatura de 1.00

```
CASTEELONS
TABLAVIEJA DE TORMES
PREUTA
SACUNTE-HUERTO
HUERCADOR
CANDAS
USLEDO DE ARRIBA
PLASENDE
LAROTE
SONDOS
PORTOFRIO (O)
BLECIO
MONFORTALES
```

Una vez que la red neuronal devuelve los resultados, eliminamos el primero y el último –suelen estar cortados– y presentamos el resto.

Si queréis ejecutar el código en local, basta con levantar un servidor web en la carpeta `generacion`. Para ello hay que abrir una ventana de terminal, ir a la carpeta y teclear alguno de estos comandos (naturalmente, tienes que tener Python o PHP instalado en tu equipo)

**Python 2.x**

```python
python -m SimpleHTTPServer 8000
```

**Python 3.x**

```python
python -m http.server 8000 --bind 127.0.0.1
```

**PHP**

```php
php -S localhost:8000
```
