import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ViewModalProps = {
  viewData: boolean;
  setViewData: (value: boolean) => void;
  sections: any;
};

export default function ViewFourVector({
  viewData,
  setViewData,
  sections,
}: ViewModalProps) {
  return (
    <Dialog open={viewData}>
      <DialogContent className="rounded-xl p-4 space-y-2 max-h-[80vh] overflow-y-auto max-w-3xl">
        <span className="text-lg font-semibold">Four Vector Analysis</span>
        {sections.map((s: any) => (
          <div className="flex flex-col border border-border hover:border-primary rounded-lg p-2 space-y-2">
            <span className="flex justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                {s.title}
              </h3>
              <span>
                <strong className="text-xs">Score:</strong>{" "}
                <span className="text-xs text-neutral">{s.body.score} </span>
              </span>
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {s.body.detail}
            </p>
            <strong className="text-xs">Reasoning:</strong>
            <span className="text-xs text-neutral"> {s.body.reasoning}</span>
          </div>
        ))}
        {/* Footer */}
        <DialogClose asChild>
          <Button
            variant="outline"
            className="w-24 justify-center text-foreground"
            onClick={() => setViewData(false)}
          >
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
