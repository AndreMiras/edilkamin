interface DetailRowProps {
  label: string;
  value: string | number;
}

const DetailRow = ({ label, value }: DetailRowProps) => (
  <div className="flex justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span>{value}</span>
  </div>
);

export default DetailRow;
