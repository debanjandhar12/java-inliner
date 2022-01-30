import libs.Bank;
import libs.SBI;

public class Main {
    public static void main(String args[])  {
        Bank b = new SBI();  
        System.out.println("ROI: "+b.rateOfInterest());
    }
}