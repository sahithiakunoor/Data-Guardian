function ClassificationReport({ report }) {
    if (!report) {
      return null;
    }
  
    const rows = Object.entries(report).filter(
      ([name]) => name !== "accuracy"
    );
  
    return (
      <div className="classification-report">
        <h3>Classification Report</h3>
  
        <table>
          <thead>
            <tr>
              <th>Class</th>
              <th>Precision</th>
              <th>Recall</th>
              <th>F1-score</th>
              <th>Support</th>
            </tr>
          </thead>
  
          <tbody>
            {rows.map(([name, values]) => (
              <tr key={name}>
                <th scope="row">{name}</th>
                <td>{(values.precision * 100).toFixed(2)}%</td>
                <td>{(values.recall*100).toFixed(2)}%</td>
                <td>{(values["f1-score"]*100).toFixed(2)}%</td>
                <td>{values.support}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  
  export default ClassificationReport;