import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FirebaseContext } from "../../firebase";
import Error404 from "../../components/layout/404";
import Layout from "../../components/layout/Layout";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { es } from "date-fns/locale";
import { Campo, InputSubmit } from "../../components/ui/Formulario";
import Boton from "../../components/ui/Boton";

const ContenerdorProducto = styled.div`
  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 2fr 1fr;
    column-gap: 2rem;
  }
`;

const CreadorProducto = styled.p`
  padding: 0.5rem 2rem;
  background-color: #da552f;
  color: #fff;
  text-transform: uppercase;
  font-weight: bold;
  display: inline-block;
  text-align: center;
`;

const Producto = () => {
  const [producto, setProducto] = useState({});
  const [error, setError] = useState(false);
  const [comentario, setComentario] = useState({});
  const [consultarDB, setConsultarDB] = useState(true);

  const router = useRouter();
  const {
    query: { id },
  } = router;

  const { firebase, usuario } = useContext(FirebaseContext);
  useEffect(() => {
    if (id && consultarDB) {
      const obtenerProducto = async () => {
        const productoQuery = await firebase.db.collection("productos").doc(id);
        const producto = await productoQuery.get();
        if (producto.exists) {
          setProducto(producto.data());
          setConsultarDB(false);
        } else {
          setError(true);
          setConsultarDB(false);
        }
      };
      obtenerProducto();
    }
  }, [id]);
  if (Object.keys(producto).length === 0 && !error) return "Cargando...";
  const {
    comentarios,
    creado,
    descripcion,
    empresa,
    nombre,
    url,
    urlImagen,
    votos,
    creador,
    haVotado,
  } = producto;

  const votarProducto = () => {
    if (!usuario) {
      return router.push("/login");
    }
    const totalVotos = votos + 1;

    if (haVotado.includes(usuario.uid)) return;

    const hanVotado = [...haVotado, usuario.uid];

    firebase.db
      .collection("productos")
      .doc(id)
      .update({ votos: totalVotos, haVotado: hanVotado });

    setProducto({
      ...producto,
      votos: totalVotos,
    });
    setConsultarDB(true);
  };

  const comentarioChange = (e) => {
    setComentario({
      ...comentario,
      [e.target.name]: e.target.value,
    });
  };

  const esCreador = (id) => {
    return creador.id === id;
  };

  const agregarComentario = (e) => {
    e.preventDefault();
    if (!usuario) {
      return router.push("/login");
    }
    comentario.usuarioId = usuario.uid;
    comentario.usuarioNombre = usuario.displayName;

    const nuevosComentarios = [...comentarios, comentario];

    firebase.db.collection("productos").doc(id).update({
      comentarios: nuevosComentarios,
    });

    setProducto({
      ...producto,
      comentarios: nuevosComentarios,
    });
    setConsultarDB(true);
  };

  const puedeBorrar = () => {
    if(!usuario) return false;
    return creador.id === usuario.uid;
  }

  const eliminarProducto = async () => {
    if (!usuario) {
      return router.push("/login");
    }
    if (creador.id !== usuario.uid) {
      return router.push("/");
    }
    try {
      await firebase.db.collection('productos').doc(id).delete();
      router.push('/')
    } catch (error) {
      console.log('Hubo un error')
    }
  }

  return (
    <Layout>
      <>
        {error ? (
          <Error404 />
        ) : (
          <div className="contenedor">
            <h1
              css={css`
                text-align: center;
                margin-top: 5rem;
              `}
            >
              {nombre}
            </h1>
            <ContenerdorProducto>
              <div>
                <p>
                  Publicado hace:{" "}
                  {formatDistanceToNow(new Date(creado), { locale: es })}
                </p>
                <p>
                  Por: {creador.nombre} de {empresa}
                </p>
                <img src={urlImagen} />
                <p>{descripcion}</p>
                {usuario && (
                  <>
                    <h2>Agrega tu comentario</h2>
                    <form onSubmit={agregarComentario}>
                      <Campo>
                        <input
                          type="text"
                          name="mensaje"
                          onChange={comentarioChange}
                        />
                      </Campo>
                      <InputSubmit type="submit" value="Agregar Comentario" />
                    </form>
                  </>
                )}
                <h2
                  css={css`
                    margin: 2rem 0;
                  `}
                >
                  Comentarios
                </h2>
                {comentarios.length === 0 ? (
                  <p>Aun no hay comentarios</p>
                ) : (
                  <ul>
                    {comentarios.map((comentario, i) => (
                      <li
                        key={`${comentario.usuarioId}-${i}`}
                        css={css`
                          border: 1px solid var(--gris3);
                          padding: 2rem;
                        `}
                      >
                        <p>{comentario.mensaje}</p>
                        <p>
                          Escrito por:
                          <span
                            css={css`
                              font-weight: bold;
                            `}
                          >
                            {" "}
                            {comentario.usuarioNombre}
                          </span>
                        </p>
                        {esCreador(comentario.usuarioId) && (
                          <CreadorProducto>Es Creador</CreadorProducto>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <aside>
                <Boton target="_black" bgColor={true} href={url}>
                  Visitar URL
                </Boton>
                <div
                  css={css`
                    margin-top: 5rem;
                  `}
                >
                  <p
                    css={css`
                      text-align: center;
                    `}
                  >
                    {votos} Votos
                  </p>
                  {usuario && <Boton onClick={votarProducto}>Votar</Boton>}
                </div>
              </aside>
            </ContenerdorProducto>
            {puedeBorrar() && 
            <Boton
              onClick={eliminarProducto}
              >Eliminar Producto</Boton>}
          </div>
        )}
      </>
    </Layout>
  );
};

export default Producto;
