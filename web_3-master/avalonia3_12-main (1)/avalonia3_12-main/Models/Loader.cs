using System.Threading.Tasks;

// Loader.cs
using ReactiveUI;
namespace DairyFarm.Models
{
    public class Loader : ReactiveObject
    {
        private bool _isBusy;

        public bool IsBusy
        {
            get => _isBusy;
            private set => this.RaiseAndSetIfChanged(ref _isBusy, value);
        }

        public async Task UnloadAsync(Warehouse warehouse)
        {
            if (IsBusy) return;

            IsBusy = true;
            try
            {
                await Task.Delay(2000);
                warehouse.ResetMilk(); 
            }
            finally
            {
                IsBusy = false;
            }
        }
    }
}
