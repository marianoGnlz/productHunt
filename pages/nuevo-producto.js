import React, { useState, useContext } from "react";
import { css } from "@emotion/react";
import Router, { useRouter } from "next/router";
import FileUploader from "react-firebase-file-uploader";
import Layout from "../components/layout/Layout";
import {
  Formulario,
  Campo,
  InputSubmit,
  Error,
} from "../components/ui/Formulario";

import useValidacion from "../hooks/useValidacion";
import validarCrearProducto from "../validacion/validarCrearProducto";
import { FirebaseContext } from "../firebase";
import Error404 from "../components/layout/404";

const STATE_INICIAL = {
  nombre: "",
  empresa: "",
  imagen: "",
  url: "",
  descripcion: "",
};

const NuevoProducto = () => {
  const [nombreImagen, setNombreImagen] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [urlImagen, setUrlImagen] = useState("");

  const [error, setError] = useState(false);

  const {
    valores,
    errores,
    handleChange,
    handleSubmit,
    handleBlur,
  } = useValidacion(STATE_INICIAL, validarCrearProducto, crearProducto);

  const { nombre, empresa, imagen, url, descripcion } = valores;

  const router = useRouter();

  const { usuario, firebase } = useContext(FirebaseContext);



  async function crearProducto() {
    if (!usuario) {
      return router.push("/login");
    }

    const producto = {
      nombre,
      empresa,
      url,
      urlImagen,
      descripcion,
      votos: 0,
      comentarios: [],
      creado: Date.now(),
      creador: {
        id: usuario.uid,
        nombre: usuario.displayName
      },
      haVotado: []
    };

    firebase.db.collection("productos").add(producto);

    return router.push('/');
  }

  const onChange = async (e) => {
    const file = e.target.files[0];

    const storageRef = await firebase.storage.ref("productos");

    const fileRef = storageRef.child(file.name);

    await fileRef.put(file);

    setUrlImagen(await fileRef.getDownloadURL());
  };



  return (
    <div>
      <Layout>
        {!usuario ? <Error404 /> : (

        <>
          <h1
            css={css`
              text-align: center;
              margin-top: 5rem;
            `}
          >
            Nuevo Producto
          </h1>
          <Formulario onSubmit={handleSubmit} noValidate>
            <fieldset>
              <legend>Información general</legend>

              <Campo>
                <label htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  placeholder="Nombre del Producto"
                  name="nombre"
                  value={nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Campo>
              {errores.nombre && <Error>{errores.nombre}</Error>}
              <Campo>
                <label htmlFor="empresa">Empresa</label>
                <input
                  type="text"
                  id="empresa"
                  placeholder="Nombre Empresa o Compañia"
                  name="empresa"
                  value={empresa}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Campo>
              {errores.empresa && <Error>{errores.empresa}</Error>}
              <Campo>
                <label htmlFor="imagen">Imagen</label>
                <input
                  accept="image/*"
                  onChange={onChange}
                  type="file"
                  id="image"
                  name="image"
                />
              </Campo>
              <Campo>
                <label htmlFor="url">URL</label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  placeholder="URL de tu producto"
                  value={url}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Campo>
              {errores.url && <Error>{errores.url}</Error>}
            </fieldset>
            <fieldset>
              <legend>Sobre tu producto</legend>
              <Campo>
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={descripcion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Campo>
              {errores.descripcion && <Error>{errores.descripcion}</Error>}
            </fieldset>
            {error && <Error>{error}</Error>}
            <InputSubmit type="submit" value="Crear Producto" />
          </Formulario>
        </>
        )}
      </Layout>
    </div>
  );
};

export default NuevoProducto;
