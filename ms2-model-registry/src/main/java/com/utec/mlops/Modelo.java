package com.utec.mlops;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Modelo {
    @JsonProperty("modelo_id") public Integer modeloId;
    @JsonProperty("nombre_modelo") public String nombreModelo;
    @JsonProperty("version") public String version;
    @JsonProperty("framework") public String framework;
    @JsonProperty("estado") public String estado;
    @JsonProperty("dataset_id") public Integer datasetId;
    @JsonProperty("fecha_entrenamiento") public String fechaEntrenamiento;
    @JsonProperty("autor") public String autor;
    @JsonProperty("hiperparametros") public String hiperparametros;
}