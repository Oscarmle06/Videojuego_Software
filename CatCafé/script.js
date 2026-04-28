// Información de los gatos
const gatos = [
    {
        nombre: "Naruto Uzumiau",
        edad: "2 años",
        caracter: "Hiperactivo y gritón",
        imagen: "gatos/Naruto_Uzumiau.png"
    },
    {
        nombre: "Gato Uchiha",
        edad: "3 años",
        caracter: "Solitario",
        imagen: "gatos/Gato_Uchiha.png"
    },
    {
        nombre: "Gatashi Hatake",
        edad: "5 años",
        caracter: "Relajado",
        imagen: "gatos/Gatashi_Hatake.png"
    },
    {
        nombre: "Itachi Michi",
        edad: "5 años",
        caracter: "Maestro del Genjutsu para conseguir premios extra",
        imagen: "gatos/Itachi_Michi.png"
    },
    {
        nombre: "Tsunade (La Quinta Ho-gata)",
        edad: "6 años",
        caracter: "Carácter fuerte...",
        imagen: "gatos/Tsunade.png"
    },
    {
        nombre: "Orochimiau",
        edad: "8 años",
        caracter: "Se mete en cajas siempre",
        imagen: "gatos/Orochimiau.png"
    },
    {
        nombre: "Madara Meow-chiha",
        edad: "7 años",
        caracter: "Muy Territorial",
        imagen: "gatos/Madara_Meow_chiha.png"
    },
    {
        nombre: "Obito Gat-uchi",
        edad: "4 años",
        caracter: "Siempre llega tarde a comer por perderse en el camino",
        imagen: "gatos/Obito_Gat-uchi.png"
    },
    
];

const menusPorDia = {
    "Lunes": [
        { 
            nombre: "Katon: Goyakatzu! (Onigiri)", 
            imagen: "comida/Lun1.png",
            descripcion: "Onigiris de arroz premium rellenos de salmón picante. Cada pieza es flambeada al momento con una técnica de fuego estilo Uchiha para un acabado crujiente." 
        },
        { 
            nombre: "Té Verde del Bosque de la Muerte", 
            imagen: "comida/Lun2.png",
            descripcion: "Una infusión intensa de matcha orgánico y hierbas silvestres. Energizante y purificante, ideal para sobrevivir a cualquier examen Chunin." 
        }
    ],
    "Martes": [
        { 
            nombre: "Chidori Fizz (Limonada Eléctrica)", 
            imagen: "comida/Mar1.png",
            descripcion: "Limonada artesanal con blue curacao y un toque de caramelo carbonatado que 'chisporrotea' en tu boca como mil pájaros cantando." 
        },
        { 
            nombre: "Sharin-gan-dwich de Jamón", 
            imagen: "comida/Mar2.png",
            descripcion: "Sándwich circular de pan artesanal con jamón serrano y queso provolone. El diseño del Sharingan está hecho con tomates deshidratados y aceitunas negras." 
        }
    ],
    "Miercoles": [
        { 
            nombre: "Ramen Ichiraku-Gatuno Jr.", 
            imagen: "comida/Mie1.png",
            descripcion: "El clásico ramen de Miso favorito de Naruto, pero con un toque felino: narutomakis cortados con forma de gatito y un caldo cocinado por 12 horas." 
        },
        { 
            nombre: "Dango de la Hoja (3 colores)", 
            imagen: "comida/Mie2.png",
            descripcion: "Brochetas de mochi dulce (rosa, blanco y verde). Tan suaves que incluso Itachi Uchiha haría una pausa en su misión para disfrutarlos." 
        }
    ],
    "Jueves": [
        { 
            nombre: "Amaterasu Black Latte", 
            imagen: "comida/Jue1.png",
            descripcion: "Café latte oscuro preparado con carbón activado y cacao amargo. Una bebida intensa cuyas sombras parecen arder eternamente en tu taza." 
        },
        { 
            nombre: "Miau-gekyu Sharingan Toast", 
            imagen: "comida/Jue2.png",
            descripcion: "Tostada de pan brioche con crema de avellanas y fresas frescas dispuestas en el complejo patrón del Mangekyō. Dulce, visual y poderosa." 
        }
    ],
    "Viernes": [
        { 
            nombre: "Susanoo Soda (Mora Azul)", 
            imagen: "comida/Vie1.png",
            descripcion: "Soda de mora azul vibrante con esferas de nitrógeno que crean un aura mística alrededor del vaso. La defensa absoluta contra el calor." 
        },
        { 
            nombre: "Takoyaki 'Tentáculos de Killer Bee'", 
            imagen: "comida/Vie2.png",
            descripcion: "Bolitas de pulpo fritas, sazonadas con salsa unagi y jengibre. Tan rítmicas y deliciosas que te harán querer rapear como el Jinchūriki del Ocho Colas." 
        }
    ],
    "Sabado": [
        { 
            nombre: "Jutsu Fuerza de un Centenar (Atún)", 
            imagen: "comida/Sab1.png",
            descripcion: "Tataki de atún sellado a la perfección. La disposición de los cortes emula el sello Byakugou de Lady Tsunade. Fuerza y elegancia en cada bocado." 
        },
        { 
            nombre: "Onigiri Relleno Akatzu-ki", 
            imagen: "comida/Sab2.png",
            descripcion: "Onigiri envuelto en alga nori con una nube roja de paprika. Relleno de atún picante, representando la peligrosidad de la organización más buscada." 
        }
    ],
    "Domingo": [
        { 
            nombre: "Bolla de Fuego Uchiha (Mochi de Fresa)", 
            imagen: "comida/Dom1.png",
            descripcion: "Mochis artesanales rellenos de helado de fresa. Su exterior es suave como una nube y su sabor es tan explosivo como un jutsu de fuego." 
        },
        { 
            nombre: "Café 'Sello Maldito' (Cargado)", 
            imagen: "comida/Dom2.png",
            descripcion: "Espresso doble extra cargado. Su espuma lleva el diseño del sello de Orochimaru. Una dosis de energía oscura para despertar tus instintos." 
        }
    ]
};

$(document).ready(function() {
    
    // 1. Detectar el día actual automáticamente
    const dias = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
    const hoy = dias[new Date().getDay()];
    
    // 2. FUNCIÓN PARA RENDERIZAR GATOS
    function cargarGatos() {
        let htmlGatos = "";
        gatos.forEach(gato => {
            htmlGatos += `
                <div class="col-md-4 mb-4">
                    <div class="card h-100 shadow-sm">
                        <img src="${gato.imagen}" class="card-img-top" alt="${gato.nombre}" style="height: 250px; object-fit: cover;">
                        <div class="card-body">
                            <h5 class="card-title text-danger">${gato.nombre}</h5>
                            <p class="card-text"><strong>Edad:</strong> ${gato.edad}</p>
                            <p class="card-text"><em>"${gato.caracter}"</em></p>
                        </div>
                    </div>
                </div>`;
        });
        $("#catsContainer").html(htmlGatos);
    }

    // 3. FUNCIÓN PARA CAMBIAR EL MENÚ
    function actualizarMenu(dia) {
    let items = menusPorDia[dia] || [];
    let htmlMenu = "";
    
    items.forEach(item => {
        htmlMenu += `
            <div class="col-md-6 mb-3">
                <div class="menu-item p-3 border rounded shadow-sm bg-light" 
                     data-img="${item.imagen}" 
                     data-nombre="${item.nombre}"
                     data-desc="${item.descripcion}" 
                     style="cursor: pointer;">
                    ${item.nombre} 🐾
                </div>
            </div>`;
    });
    $("#menuContainer").html(htmlMenu);
    }

    // EVENTO: Clic para abrir descripción
    $(document).on("click", ".menu-item", function() {
        const nombre = $(this).data("nombre");
        const imagen = $(this).data("img");
        const descripcion = $(this).data("desc");

        // Llenar el modal con los datos
        $("#modalTitulo").text(nombre);
        $("#modalImagen").attr("src", imagen);
        $("#modalDescripcion").text(descripcion);

        // Mostrar el modal
        const myModal = new bootstrap.Modal(document.getElementById('menuModal'));
        myModal.show();
    });

    // EVENTOS
    $("#daySelector").on("change", function() {
        actualizarMenu($(this).val());
    });

    // Efecto Hover Mejorado
    $(document).on("mousemove", ".menu-item", function(e) {
        const imgUrl = $(this).data("img");
        $("#hoverImagePreview")
            .css({
                "display": "block",
                "top": (e.pageY + 15) + "px",
                "left": (e.pageX + 15) + "px",
                "background-image": `url(${imgUrl})`
            });
    }).on("mouseleave", ".menu-item", function() {
        $("#hoverImagePreview").hide();
    });

    function cargarGatos() {
    let indicatorsHtml = "";
    let innerHtml = "";

    gatos.forEach((gato, index) => {
        const activeClass = index === 0 ? "active" : "";
        
        // Crear indicadores
        indicatorsHtml += `
            <button type="button" data-bs-target="#uchihaCarousel" data-bs-slide-to="${index}" 
                class="${activeClass}" aria-label="Slide ${index + 1}"></button>`;

        // Crear diapositivas
        innerHtml += `
            <div class="carousel-item ${activeClass}">
                <img src="${gato.imagen}" class="d-block w-100" alt="${gato.nombre}" 
                    style="height: 500px; object-fit: cover; filter: brightness(70%);">
                <div class="carousel-caption d-none d-md-block" style="background: rgba(0,0,0,0.6); border-radius: 10px; border: 1px solid #8b0000;">
                    <h3 class="font-permanent-marker text-danger">${gato.nombre}</h3>
                    <p><strong>Edad:</strong> ${gato.edad} | <strong>Carácter:</strong> ${gato.caracter}</p>
                </div>
            </div>`;
    });

    $("#carouselIndicators").html(indicatorsHtml);
    $("#carouselInner").html(innerHtml);
}

    // Inicializar todo
    cargarGatos();
    actualizarMenu(hoy); // Inicia con el día real de la semana
    $("#daySelector").val(hoy); // Sincroniza el select con el día real
});

// REFERENCIAS
/*
https://getbootstrap.com/docs/5.3/components/carousel/
https://getbootstrap.com/docs/5.3/components/modal/
https://getbootstrap.com/docs/5.3/layout/grid/
https://fonts.google.com/specimen/Permanent+Marker
https://fonts.google.com/noto/specimen/Noto+Sans+JP
https://api.jquery.com/mousemove/
https://api.jquery.com/data/
https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Date

*/