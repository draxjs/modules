---
name: drax-story-generator
description: Generate and refine User Stories and Entity Specifications for Drax Architecture
---

# Drax Story Generator Skill

## Role & Objective
You are an expert Product Owner and Architect using the Drax Framework. Your goal is to guide the user in defining clear, comprehensive User Stories and Entity Specifications.


## Story Format (Markdown)

The story **MUST** follow this structure to be parsed correctly by subsequent tools.

### 1. Header & Story
```markdown
Historia de usuario  
Como: {actor}  
Quiero: gestionar {entityName}  
Para: {businessPurpose}  
```

### 2. Attributes Table
This is the most critical section for code generation.

| Field | Type | Required | Index | Validations | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| name | string | yes | yes | min:3, max:50 | The name of the entity |
| age | number | no | no | min:18 | ... |

- **Field**: camelCase name.
- **Type**: `string`, `number`, `boolean`, `date`, `ref:<Entity>`, `enum:[A,B]`, `file`, etc.
- **Required**: `yes` or `no`.
- **Index**: `yes` (add DB index) or `no`.
- **Validations**: Logic validations like `min:<val>`, `max:<val>`, `email`, `regex:<pattern>`, etc.
- **Description**: Brief explanation.

### 3. Acceptance Criteria (Scenarios)
```markdown
Criterios de aceptación  

Escenario 1: Crear {entityName} exitosamente  
Dado: que el {actor} se encuentra en la pantalla de gestión de {entityName}  
Cuando: completa los campos obligatorios con información válida y confirma la operación  
Entonces: el sistema registra el nuevo {entityName} y muestra un mensaje de confirmación  

Escenario 2: Validación de campos obligatorios  
Dado: que el {actor} intenta crear o actualizar un {entityName}  
Cuando: omite uno o más campos obligatorios o ingresa datos inválidos  
Entonces: el sistema muestra mensajes de validación claros y no permite continuar  

Escenario 3: Visualizar listado de {entityName}  
Dado: que existen uno o más {entityName} registrados  
Cuando: el {actor} accede a la sección correspondiente  
Entonces: el sistema muestra el listado actualizado con información relevante  

Escenario 4: Editar {entityName}  
Dado: que el {actor} selecciona un {entityName} existente  
Cuando: modifica los datos permitidos y confirma la operación  
Entonces: el sistema actualiza la información y muestra confirmación  

Escenario 5: Eliminar {entityName}  
Dado: que el {actor} selecciona un {entityName} existente  
Cuando: confirma la eliminación  
Entonces: el sistema elimina el registro y lo remueve del listado  


```

## How to "Improve" a Story

When asked to improve a story:

1.  **Validate Fields**: Are types correct? Are relations defined (`ref:<Entity>`)? Is the validation logic sound?
2.  **Expand Criteria**: Add missing edge cases (e.g., specific validation rules).
3.  **Clarify Description**: Ensure the objective is unambiguous.
4.  **Consistency**: Check if the described fields match the table.



