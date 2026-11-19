
# Apolo 12 · Versión animada 3D

Montaje vertical de 40,933 segundos y 30 fotogramas por segundo. Las cámaras virtuales recorren decorados con geometría, luces, materiales y objetos independientes. La locución y la mezcla se conservan desde el primer montaje, con las mismas marcas de los efectos.

| Tramo | Movimiento principal |
| --- | --- |
| 0–8 s | La cámara se acerca al Saturno V durante el despegue. La vegetación se inclina, el agua cambia de brillo y el humo se expande. Los dos impactos se ven desde lados distintos, entre capas de nubes que se desplazan a diferentes distancias. |
| 8–12 s | La cámara entra en la cabina. Los astronautas reaccionan. El inserto muestra los testigos, las agujas y la señal del bus. |
| 12–22 s | La cámara va de las lecturas a John Aaron. El mapa y las pantallas siguen activos mientras Aaron señala la consola. |
| 22–32 s | La cámara pasa del mando a Houston y vuelve a la cabina. El guante de Alan Bean llega al extremo de la palanca. El mando gira sobre su bisagra hasta AUX. |
| 32–41 s | Las lecturas se estabilizan y cambia la iluminación de la cabina. La cámara se abre mientras la etapa S-IVB y la nave Apolo se alejan de la Tierra. La Luna queda al fondo durante el plano. |

Las secuencias están en web/story.js. Los modelos, cámaras y acciones están en web/exterior.js, web/interior.js, web/ingeniero.js y web/orbit.js. Ejecutar node render.mjs frames-3d 0-1227 1080 desde esta carpeta regenera las imágenes 3D del montaje. Los subtítulos se aplican sobre el render.

Para actualizar el plano orbital desde el fotograma 1123, ejecutar node render.mjs frames-3d 1123-1227 1080. Las superficies de la Tierra y la Luna usan mapas de NASA Earth Observatory y NASA Scientific Visualization Studio sobre esferas 3D. Créditos y enlaces en el texto de publicación.
