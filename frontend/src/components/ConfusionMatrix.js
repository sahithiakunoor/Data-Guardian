
function ConfusionMatrix({ labels, matrix }) {
    if (!labels || !matrix) {
      return null;
    }
  
    return (
      <div className="confusion-matrix-container">
        <h3>Confusion Matrix</h3>
  
        <p>Rows: Actual Class | Columns: Predicted Class</p>
  
        <table className="confusion-matrix-table">
          <thead>
            <tr>
              <th>Actual / Predicted</th>
  
              {labels.map((label) => (
                <th key={label}>
                  Predicted {label}
                </th>
              ))}
            </tr>
          </thead>
  
          <tbody>
            {matrix.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <th scope="row">
                  Actual {labels[rowIndex]}
                </th>
  
                {row.map((value, colIndex) => (
                  <td
                    key={colIndex}
                    className={
                      rowIndex === colIndex
                        ? "correct-prediction"
                        : "incorrect-prediction"
                    }
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  
  export default ConfusionMatrix;
  