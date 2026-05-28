$(document).ready(function() {
    const dias = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
    const hoy = dias[new Date().getDay()];

    function obtenerGatosBD() {
        $.ajax({
            url: 'api/gatos', 
            type: 'GET',
            dataType: 'json',
            success: function(gatosDesdeBD) {
                renderizarGatos(gatosDesdeBD);
            },
            error: function(xhr, status, error) {
                console.error("Error al traer los gatos ninja: ", error);
            }
        });
    }

    function obtenerMenuBD(dia) {
        $.ajax({
            url: 'api/menu',
            type: 'GET',
            data: { dia_semana: dia },
            dataType: 'json',
            success: function(menuDesdeBD) {
                actualizarMenu(menuDesdeBD);
            },
            error: function(xhr, status, error) {
                console.error("Error al traer el menú del día: ", error);
            }
        });
    }


    // Dibuja el carrusel de Bootstrap con los datos de la BD
    function renderizarGatos(gatos) {
        let indicatorsHtml = "";
        let innerHtml = "";

        gatos.forEach((gato, index) => {
            const activeClass = index === 0 ? "active" : "";
            
            indicatorsHtml += `
                <button type="button" data-bs-target="#uchihaCarousel" data-bs-slide-to="${index}" 
                    class="${activeClass}" aria-label="Slide ${index + 1}"></button>`;

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

    // Dibuja la lista de platillos del día que llegaron de la BD
    function actualizarMenu(items) {
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

    // Clic en un platillo para abrir el modal de Bootstrap
    $(document).on("click", ".menu-item", function() {
        const nombre = $(this).data("nombre");
        const imagen = $(this).data("img");
        const descripcion = $(this).data("desc");

        $("#modalTitulo").text(nombre);
        $("#modalImagen").attr("src", imagen);
        $("#modalDescripcion").text(descripcion);

        const myModal = new bootstrap.Modal(document.getElementById('menuModal'));
        myModal.show();
    });

    // Detectar cuando el usuario cambia el día en el selector de la interfaz
    $("#daySelector").on("change", function() {
    const diaSeleccionado = $(this).val();
    obtenerMenuBD(diaSeleccionado);
    $("#currentDayText").text(diaSeleccionado);
});

    // Efecto de vista previa flotante de la imagen al pasar el mouse (Hover)
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


    obtenerGatosBD();
    obtenerMenuBD(hoy);    
    $("#daySelector").val(hoy);      
    $("#currentDayText").text(hoy);
});