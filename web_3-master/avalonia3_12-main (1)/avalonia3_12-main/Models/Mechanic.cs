using System.Threading.Tasks;
using ReactiveUI;

namespace DairyFarm.Models
{
    public class Mechanic : ReactiveObject
    {
        private bool _isBusy;

        public bool IsBusy
        {
            get => _isBusy;
            private set => this.RaiseAndSetIfChanged(ref _isBusy, value);
        }

        public async Task RepairAsync()
        {
            IsBusy = true;
            await Task.Delay(3000);
            IsBusy = false;
        }
    }
}
